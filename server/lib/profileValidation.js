const { STEP_COLUMNS, REQUIRED_COLUMNS, ENUMS, TEXT_LIMITS } = require("./profileFields");

const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/**
 * Validates + sanitizes a single onboarding step's payload.
 * Never trusts the frontend: re-checks required-ness, enum membership,
 * numeric ranges and text length server-side, independent of whatever the
 * <select>/<input> constraints on the client claimed to enforce.
 *
 * Returns { errors: string[], cleaned: {} }. `cleaned` only ever contains
 * whitelisted column names — the caller can safely use its keys as SQL
 * identifiers because they are drawn from STEP_COLUMNS, not from req.body.
 */
function validateStep(step, body) {
  const columns = STEP_COLUMNS[step];
  const required = REQUIRED_COLUMNS[step] || [];
  const errors = [];
  const cleaned = {};

  if (!columns) {
    return { errors: [`Invalid step: ${step}`], cleaned };
  }

  for (const col of columns) {
    let value = Object.prototype.hasOwnProperty.call(body, col) ? body[col] : undefined;

    if (typeof value === "string") value = value.trim();

    if (isBlank(value)) {
      if (required.includes(col)) {
        errors.push(`${humanize(col)} is required.`);
      }
      cleaned[col] = null;
      continue;
    }

    // Enum fields
    if (ENUMS[col] && !ENUMS[col].includes(value)) {
      errors.push(`${humanize(col)} has an invalid value.`);
      continue;
    }

    // Column-specific validation
    switch (col) {
      case "date_of_birth": {
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) {
          errors.push("Date of birth is invalid.");
          break;
        }
        const ageMs = Date.now() - dob.getTime();
        const age = ageMs / (1000 * 60 * 60 * 24 * 365.25);
        if (dob > new Date()) {
          errors.push("Date of birth cannot be in the future.");
        } else if (age < 18) {
          errors.push("You must be at least 18 years old.");
        } else if (age > 100) {
          errors.push("Date of birth is invalid.");
        } else {
          cleaned[col] = value;
        }
        break;
      }
      case "weight": {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 30 || n > 300) {
          errors.push("Weight must be between 30 and 300 kg.");
        } else {
          cleaned[col] = String(n);
        }
        break;
      }
      case "siblings_count": {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0 || n > 30) {
          errors.push("Number of siblings must be a whole number between 0 and 30.");
        } else {
          cleaned[col] = n;
        }
        break;
      }
      case "country_id":
      case "nationality_id": {
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) {
          errors.push(`${humanize(col)} is invalid.`);
        } else {
          cleaned[col] = n;
        }
        break;
      }
      default: {
        if (typeof value !== "string") {
          errors.push(`${humanize(col)} is invalid.`);
          break;
        }
        const limit = TEXT_LIMITS[col];
        if (limit && value.length > limit) {
          errors.push(`${humanize(col)} must be ${limit} characters or fewer.`);
          break;
        }
        cleaned[col] = value;
      }
    }
  }

  return { errors, cleaned };
}

/**
 * Validates the partner-countries multi-select. Returns a de-duplicated
 * array of positive integer country IDs, or throws-free — invalid entries
 * are reported in `errors`, existence against the countries table is the
 * caller's job (it already has a `pool` handle).
 */
function validatePartnerCountryIds(raw) {
  const errors = [];
  if (raw === undefined || raw === null) return { errors, ids: [] };
  if (!Array.isArray(raw)) {
    errors.push("Preferred countries must be a list.");
    return { errors, ids: [] };
  }
  const ids = [];
  for (const v of raw) {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) {
      errors.push("Preferred countries contains an invalid country.");
      continue;
    }
    if (!ids.includes(n)) ids.push(n);
  }
  return { errors, ids };
}

function humanize(col) {
  return col
    .replace(/_/g, " ")
    .replace(/\bid\b/gi, "")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

module.exports = { validateStep, validatePartnerCountryIds };
