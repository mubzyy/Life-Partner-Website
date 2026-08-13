/**
 * Shared helpers for the `matches` table — the single authoritative record
 * of "these two users are mutually matched". Both interactions.js (which
 * creates matches) and profile.js (which checks them for the 'matches'
 * profile-visibility setting) read/write through here so there's exactly
 * one definition of what a match is.
 */

// Canonical ordering so (A,B) and (B,A) are always the same row.
function orderPair(userAId, userBId) {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

async function isMatched(pool, userAId, userBId) {
  const [low, high] = orderPair(userAId, userBId);
  const result = await pool.query(
    `SELECT 1 FROM matches WHERE user_low_id = $1 AND user_high_id = $2 AND status = 'active'`,
    [low, high]
  );
  return result.rows.length > 0;
}

// Idempotent — safe to call every time a mutual like is detected, even if
// the match already exists (ON CONFLICT DO NOTHING backed by the table's
// UNIQUE constraint, not just an application-level check).
async function ensureMatch(pool, userAId, userBId) {
  const [low, high] = orderPair(userAId, userBId);
  const result = await pool.query(
    `INSERT INTO matches (user_low_id, user_high_id) VALUES ($1, $2)
     ON CONFLICT (user_low_id, user_high_id) DO NOTHING
     RETURNING id`,
    [low, high]
  );
  return result.rows.length > 0; // true only if this call newly created it
}

module.exports = { isMatched, ensureMatch, orderPair };
