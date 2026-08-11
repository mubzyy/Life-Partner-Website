/**
 * Single source of truth for which user_profiles columns belong to which
 * onboarding step, which are required to advance, and what values they may
 * hold. Both the validator and the completion calculator read from here so
 * there is exactly one definition of "what a complete profile looks like" —
 * never several competing ones scattered across routes/components.
 */

// Plain (non-relational) columns writable per step, via PUT /api/profile/me.
// profile_photo_url is intentionally excluded — it's only ever written by
// the photo upload/delete endpoints, never by the generic profile PUT.
const STEP_COLUMNS = {
  1: [
    "gender", "date_of_birth", "marital_status", "religion", "sect",
    "mother_tongue", "height", "weight", "country_id", "nationality_id",
    "state", "city", "address", "about_me",
  ],
  2: ["education", "occupation", "annual_income"],
  3: ["father_occupation", "mother_occupation", "siblings_count", "family_type", "family_values"],
  4: ["prayer_frequency", "religious_preference", "dietary_preference", "smoking", "drinking"],
  5: ["partner_age_range", "partner_marital_status", "partner_education", "partner_height_range", "partner_about"],
};

// Fields that must be filled for a step's "Continue" click to succeed.
// Fields left out here (address, annual_income, about_me, partner_about,
// partner countries) are optional, matching the UI's own "(Optional)" hints.
const REQUIRED_COLUMNS = {
  1: ["gender", "date_of_birth", "marital_status", "religion", "sect", "mother_tongue", "height", "weight", "country_id", "nationality_id", "state", "city"],
  2: ["education", "occupation"],
  3: ["father_occupation", "mother_occupation", "siblings_count", "family_type", "family_values"],
  4: ["prayer_frequency", "religious_preference", "dietary_preference", "smoking", "drinking"],
  5: ["partner_age_range", "partner_marital_status", "partner_education", "partner_height_range"],
};

// Every field that counts toward the completion percentage, including
// optional ones and the two fields handled outside STEP_COLUMNS
// (profile_photo_url via uploads, partner_countries via the relational table).
const COMPLETION_FIELDS = {
  1: ["profile_photo_url", "gender", "date_of_birth", "marital_status", "religion", "sect", "mother_tongue", "height", "weight", "country_id", "nationality_id", "state", "city", "address", "about_me"],
  2: ["education", "occupation", "annual_income"],
  3: ["father_occupation", "mother_occupation", "siblings_count", "family_type", "family_values"],
  4: ["prayer_frequency", "religious_preference", "dietary_preference", "smoking", "drinking"],
  5: ["partner_age_range", "partner_marital_status", "partner_education", "partner_height_range", "partner_about", "partner_countries"],
};

const ENUMS = {
  gender: ["Male", "Female"],
  marital_status: ["Never Married", "Divorced", "Widowed", "Already Married"],
  religion: ["Islam", "Other"],
  sect: ["Sunni", "Shia", "Just Muslim", "Other"],
  height: ["4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""],
  education: ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate / PhD", "Islamic Education"],
  annual_income: ["Below $20k", "$20k - $50k", "$50k - $100k", "$100k - $200k", "Above $200k", "Prefer not to say"],
  family_type: ["Nuclear", "Joint"],
  family_values: ["Orthodox", "Traditional", "Moderate", "Liberal"],
  prayer_frequency: ["Always (5 times a day)", "Usually", "Sometimes", "Rarely"],
  religious_preference: ["Wear Hijab / Keep Beard", "Sometimes", "No Preference"],
  dietary_preference: ["Halal Always", "Mostly Halal", "Doesn't matter"],
  smoking: ["No", "Occasionally", "Yes"],
  drinking: ["No", "Occasionally", "Yes"],
  partner_age_range: ["18 - 25", "26 - 30", "31 - 35", "36 - 40", "40+", "No Preference"],
  partner_marital_status: ["Never Married", "Divorced", "Widowed", "Open to all"],
  partner_education: ["Bachelor's Degree or higher", "Master's Degree or higher", "Doesn't matter"],
  partner_height_range: ["5'0\" - 5'5\"", "5'5\" - 5'10\"", "5'10\" and above", "No Preference"],
};

// Free-text fields with a sane max length (defends against abuse / storage bloat).
const TEXT_LIMITS = {
  mother_tongue: 50,
  state: 100,
  city: 100,
  address: 500,
  about_me: 2000,
  occupation: 100,
  father_occupation: 100,
  mother_occupation: 100,
  partner_about: 2000,
};

const STEP_IDS = [1, 2, 3, 4, 5];

module.exports = { STEP_COLUMNS, REQUIRED_COLUMNS, COMPLETION_FIELDS, ENUMS, TEXT_LIMITS, STEP_IDS };
