const { COMPLETION_FIELDS, STEP_IDS } = require("./profileFields");

const isFilled = (v) => v !== null && v !== undefined && String(v).trim() !== "";

/**
 * The one and only completion calculation for the app. Both the Complete
 * Profile wizard and the Dashboard widget call this (via GET /api/profile/me)
 * instead of each keeping their own hardcoded percentage or re-deriving it
 * from raw rows independently.
 *
 * @param profileRow   the user_profiles row (or {} if none exists yet)
 * @param partnerCountryCount  number of rows in user_preferred_countries for this user
 */
function calculateCompletion(profileRow, partnerCountryCount) {
  const row = profileRow || {};
  const perStep = {};
  let totalFilled = 0;
  let totalFields = 0;

  for (const step of STEP_IDS) {
    const fields = COMPLETION_FIELDS[step];
    let filled = 0;
    for (const field of fields) {
      const value = field === "partner_countries" ? (partnerCountryCount > 0 ? "x" : "") : row[field];
      if (isFilled(value)) filled += 1;
    }
    perStep[step] = { filled, total: fields.length, percent: Math.round((filled / fields.length) * 100) };
    totalFilled += filled;
    totalFields += fields.length;
  }

  const lastCompletedStep = Number(row.last_completed_step) || 0;
  const isComplete = !!row.onboarding_completed;
  const completedSteps = STEP_IDS.filter((s) => s <= lastCompletedStep);
  const currentStep = isComplete ? 5 : Math.min(lastCompletedStep + 1, 5);

  return {
    profileCompletion: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0,
    stepCompletion: perStep,
    completedSteps,
    currentStep,
    isComplete,
  };
}

module.exports = { calculateCompletion };
