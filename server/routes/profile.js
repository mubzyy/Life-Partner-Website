const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { upload, PHOTOS_DIR } = require("../middleware/upload");
const { STEP_IDS } = require("../lib/profileFields");
const { validateStep, validatePartnerCountryIds } = require("../lib/profileValidation");
const { calculateCompletion } = require("../lib/profileCompletion");

const router = express.Router();

// ── Shared loader ──────────────────────────────────────────────────────────
// Single query shape used by GET /me, PUT /me and the photo endpoints so the
// frontend always receives the same fully-hydrated profile object — one
// source of truth, no drifting response shapes.
async function loadFullProfile(userId) {
  const result = await pool.query(
    `
    SELECT
      u.id AS user_id, u.first_name, u.last_name, u.email,
      up.profile_photo_url, up.gender, up.date_of_birth, up.marital_status,
      up.height, up.weight, up.religion, up.sect, up.mother_tongue,
      up.nationality, up.nationality_id, n.nationality AS nationality_name,
      up.country_id, c.name AS country_name, c.flag_emoji AS country_flag,
      up.state, up.city, up.address, up.about_me,
      up.occupation, up.education, up.annual_income,
      up.father_occupation, up.mother_occupation, up.siblings_count, up.family_type, up.family_values,
      up.smoking, up.drinking, up.prayer_frequency, up.religious_preference, up.dietary_preference,
      up.partner_age_range, up.partner_marital_status, up.partner_education, up.partner_height_range, up.partner_about,
      up.onboarding_completed, up.last_completed_step,
      up.created_at, up.updated_at
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN countries c ON c.id = up.country_id
    LEFT JOIN nationalities n ON n.id = up.nationality_id
    WHERE u.id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  const [photosResult, countriesResult] = await Promise.all([
    pool.query(
      `SELECT id, photo_url, is_primary, created_at FROM user_photos WHERE user_id = $1 ORDER BY is_primary DESC, created_at DESC`,
      [userId]
    ),
    pool.query(
      `SELECT c.id, c.name, c.flag_emoji FROM user_preferred_countries pc
       JOIN countries c ON c.id = pc.country_id WHERE pc.user_id = $1 ORDER BY c.name ASC`,
      [userId]
    ),
  ]);

  const completion = calculateCompletion(row, countriesResult.rows.length);

  return {
    ...row,
    partner_countries: countriesResult.rows,
    photos: photosResult.rows,
    completion,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/profile/me — the authenticated user's own full profile.
// ─────────────────────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const full = await loadFullProfile(req.user.id);
    if (!full) return res.status(404).json({ message: "User not found" });
    res.json(full);
  } catch (err) {
    console.error("GET /profile/me error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/profile/me — persists one onboarding step for the authenticated
// user. Body: { step: 1-5, data: {...fields}, complete?: boolean }.
// The user id is ALWAYS taken from the verified JWT (req.user.id) — the
// frontend has no way to write another user's profile.
// ─────────────────────────────────────────────────────────────────────────
router.put("/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const step = Number(req.body.step);
  const data = req.body.data && typeof req.body.data === "object" ? req.body.data : {};

  if (!STEP_IDS.includes(step)) {
    return res.status(400).json({ message: "Invalid step.", errors: ["step must be between 1 and 5."] });
  }

  const { errors, cleaned } = validateStep(step, data);

  let partnerCountryIds = null;
  if (step === 5) {
    const pc = validatePartnerCountryIds(data.partner_countries);
    errors.push(...pc.errors);
    partnerCountryIds = pc.ids;
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Referential integrity checks — never trust that a submitted FK exists.
    if (cleaned.country_id) {
      const c = await client.query("SELECT id FROM countries WHERE id = $1", [cleaned.country_id]);
      if (c.rows.length === 0) throw httpError(400, "Selected country of residence does not exist.");
    }
    if (cleaned.nationality_id) {
      const n = await client.query("SELECT nationality FROM nationalities WHERE id = $1", [cleaned.nationality_id]);
      if (n.rows.length === 0) throw httpError(400, "Selected nationality does not exist.");
      // Keep the legacy free-text `nationality` column in sync for older readers
      // (MyProfilePage/search/matches still display this text column directly).
      cleaned.nationality = n.rows[0].nationality;
    }
    if (step === 5 && partnerCountryIds.length > 0) {
      const found = await client.query("SELECT id FROM countries WHERE id = ANY($1::int[])", [partnerCountryIds]);
      if (found.rows.length !== partnerCountryIds.length) {
        throw httpError(400, "One or more preferred countries do not exist.");
      }
    }

    // Ensure a user_profiles row exists before updating it.
    await client.query(
      `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    const setClauses = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(cleaned)) {
      setClauses.push(`${key} = $${i}`);
      values.push(value);
      i += 1;
    }
    setClauses.push(`last_completed_step = GREATEST(last_completed_step, $${i})`);
    values.push(step);
    i += 1;

    if (step === 5 && req.body.complete === true) {
      setClauses.push(`onboarding_completed = true`);
    }
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(userId);
    await client.query(
      `UPDATE user_profiles SET ${setClauses.join(", ")} WHERE user_id = $${i}`,
      values
    );

    if (step === 5) {
      await client.query(`DELETE FROM user_preferred_countries WHERE user_id = $1`, [userId]);
      for (const countryId of partnerCountryIds) {
        await client.query(
          `INSERT INTO user_preferred_countries (user_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, countryId]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.statusCode) {
      client.release();
      return res.status(err.statusCode).json({ message: err.message, errors: [err.message] });
    }
    console.error("PUT /profile/me error:", err);
    client.release();
    return res.status(500).json({ message: "Server Error" });
  }
  client.release();

  try {
    const full = await loadFullProfile(userId);
    res.json(full);
  } catch (err) {
    console.error("PUT /profile/me reload error:", err);
    res.status(500).json({ message: "Profile saved, but failed to reload it." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/profile/me/photos — multipart photo upload for the authenticated
// user. The Step-1 avatar picker always uploads as the primary photo.
// ─────────────────────────────────────────────────────────────────────────
router.post(
  "/me/photos",
  authMiddleware,
  (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Photo is too large. Maximum size is 5MB." });
      }
      if (err.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({ message: "Unsupported file type. Please upload a JPEG, PNG, or WEBP image." });
      }
      console.error("Photo upload error:", err);
      return res.status(400).json({ message: "Photo upload failed." });
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No photo file was provided." });
    }

    const userId = req.user.id;
    const relativeUrl = `/uploads/photos/${req.file.filename}`;
    const makePrimary = req.body.primary !== "false"; // defaults to true

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      if (makePrimary) {
        await client.query(
          `UPDATE user_photos SET is_primary = false WHERE user_id = $1 AND is_primary = true`,
          [userId]
        );
      }

      const inserted = await client.query(
        `INSERT INTO user_photos (user_id, photo_url, is_primary) VALUES ($1, $2, $3)
         RETURNING id, photo_url, is_primary, created_at`,
        [userId, relativeUrl, makePrimary]
      );

      if (makePrimary) {
        await client.query(
          `UPDATE user_profiles SET profile_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
          [relativeUrl, userId]
        );
      }

      await client.query("COMMIT");
      client.release();

      const full = await loadFullProfile(userId);
      res.status(201).json({ photo: inserted.rows[0], profile: full });
    } catch (err) {
      await client.query("ROLLBACK");
      client.release();
      fs.unlink(req.file.path, () => {});
      console.error("POST /profile/me/photos error:", err);
      res.status(500).json({ message: "Failed to save the uploaded photo." });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/profile/me/photos/:photoId
// ─────────────────────────────────────────────────────────────────────────
router.delete("/me/photos/:photoId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const photoId = Number(req.params.photoId);
  if (!Number.isInteger(photoId) || photoId <= 0) {
    return res.status(400).json({ message: "Invalid photo id." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query(
      `SELECT id, photo_url, is_primary FROM user_photos WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [photoId, userId]
    );
    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      // Ownership is never assumed — a photo that isn't this user's is reported as not found.
      return res.status(404).json({ message: "Photo not found." });
    }
    const photo = found.rows[0];
    await client.query(`DELETE FROM user_photos WHERE id = $1`, [photoId]);

    let newPrimaryUrl = null;
    if (photo.is_primary) {
      const next = await client.query(
        `SELECT id, photo_url FROM user_photos WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (next.rows.length > 0) {
        await client.query(`UPDATE user_photos SET is_primary = true WHERE id = $1`, [next.rows[0].id]);
        newPrimaryUrl = next.rows[0].photo_url;
      }
      await client.query(
        `UPDATE user_profiles SET profile_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
        [newPrimaryUrl, userId]
      );
    }

    await client.query("COMMIT");
    client.release();

    // Best-effort disk cleanup — filename is derived with path.basename so a
    // corrupted/legacy photo_url can never escape the photos directory.
    const filePath = path.join(PHOTOS_DIR, path.basename(photo.photo_url));
    fs.unlink(filePath, () => {});

    const full = await loadFullProfile(userId);
    res.json({ message: "Photo deleted.", profile: full });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error("DELETE /profile/me/photos error:", err);
    res.status(500).json({ message: "Failed to delete photo." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/profile/:userId — public read of any user's profile (used when
// browsing other members: Search, Matches, Profile View, Messages headers).
// Read-only, no ownership implied — writes always go through /me.
// ─────────────────────────────────────────────────────────────────────────
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  try {
    const full = await loadFullProfile(userId);
    if (!full) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(full);
  } catch (err) {
    console.error("GET /profile/:userId error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = router;
