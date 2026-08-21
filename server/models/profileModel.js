const pool = require("../db");
const { calculateCompletion } = require("../lib/profileCompletion");
const subscriptionModel = require("./subscriptionModel");

// ── Shared loader ──────────────────────────────────────────────────────────
// Single query shape used by GET /me, PUT /me and the photo endpoints so the
// frontend always receives the same fully-hydrated profile object — one
// source of truth, no drifting response shapes.
async function loadFullProfile(userId) {
    const result = await pool.query(
        `
    SELECT
      u.id AS user_id, u.first_name, u.last_name, u.email, u.last_login,
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
    const isPremium = await subscriptionModel.isUserPremium(userId);

    return {
        ...row,
        partner_countries: countriesResult.rows,
        photos: photosResult.rows,
        completion,
        isPremium,
    };
}

async function countryExists(countryId) {
    const result = await pool.query("SELECT id FROM countries WHERE id = $1", [countryId]);
    return result.rows.length > 0;
}

async function findNationality(nationalityId) {
    const result = await pool.query("SELECT nationality FROM nationalities WHERE id = $1", [nationalityId]);
    return result.rows[0]?.nationality || null;
}

async function countriesExistById(countryIds) {
    const result = await pool.query("SELECT id FROM countries WHERE id = ANY($1::int[])", [countryIds]);
    return result.rows.length === countryIds.length;
}

// Persists one onboarding step: ensures a user_profiles row exists, applies
// the already-validated `cleaned` fields, advances last_completed_step,
// optionally flags onboarding_completed (step 5 only), and (step 5 only)
// replaces the user's preferred-countries list. All inside one transaction.
async function saveStep({ userId, step, cleaned, partnerCountryIds, markComplete }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

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

        if (step === 5 && markComplete) {
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
        throw err;
    } finally {
        client.release();
    }
}

// Backs the real, admin-configurable platform_settings.max_photos limit —
// checked by the controller BEFORE savePhoto is called.
async function countPhotos(userId) {
    const result = await pool.query(`SELECT COUNT(*) FROM user_photos WHERE user_id = $1`, [userId]);
    return parseInt(result.rows[0].count, 10);
}

// Multipart photo upload write: ensures a user_profiles row exists, demotes
// any existing primary photo (if this one is becoming primary), inserts the
// new photo row, and updates the profile's headline photo_url — together or
// not at all.
async function savePhoto({ userId, relativeUrl, makePrimary }) {
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
        return inserted.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

// Deletes a photo the user owns. If it was the primary photo, promotes the
// next-most-recent remaining photo (if any) to primary and updates the
// profile's headline photo_url to match (or clears it if none remain).
// Returns { deletedPhoto } on success, or null if the photo isn't found /
// isn't owned by this user.
async function deletePhoto({ userId, photoId }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const found = await client.query(
            `SELECT id, photo_url, is_primary FROM user_photos WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [photoId, userId]
        );
        if (found.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
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
        return { deletedPhoto: photo };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function getVisibilitySettings(userId) {
    const result = await pool.query(
        "SELECT profile_visibility, last_seen_visibility FROM user_settings WHERE user_id = $1",
        [userId]
    );
    return {
        profileVisibility: result.rows[0]?.profile_visibility || "everyone",
        lastSeenVisibility: result.rows[0]?.last_seen_visibility || "matches",
    };
}

async function isBlockedEitherWay(userAId, userBId) {
    const result = await pool.query(
        `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
        [userAId, userBId]
    );
    return result.rows.length > 0;
}

module.exports = {
    loadFullProfile, countryExists, findNationality, countriesExistById,
    saveStep, savePhoto, deletePhoto, getVisibilitySettings, isBlockedEitherWay, countPhotos,
};
