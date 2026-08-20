const pool = require("../db");

/**
 * The `matches` table — the single authoritative record of "these two users
 * are mutually matched". Both interactionsController (which creates matches)
 * and profileController (which checks them for the 'matches' profile-
 * visibility setting) go through here so there's exactly one definition of
 * what a match is.
 *
 * NOTE: this is distinct from models/matchesModel.js, which is the
 * recommendation/discovery feed for GET /api/matches (candidates you
 * haven't interacted with yet). This file owns the `matches` DB table only.
 */

// Canonical ordering so (A,B) and (B,A) are always the same row.
function orderPair(userAId, userBId) {
    return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

async function isMatched(userAId, userBId) {
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
async function ensureMatch(userAId, userBId) {
    const [low, high] = orderPair(userAId, userBId);
    const result = await pool.query(
        `INSERT INTO matches (user_low_id, user_high_id) VALUES ($1, $2)
         ON CONFLICT (user_low_id, user_high_id) DO NOTHING
         RETURNING id`,
        [low, high]
    );
    return result.rows.length > 0; // true only if this call newly created it
}

// Un-matches a pair (used when a like is reversed by a pass).
async function unmatch(userAId, userBId) {
    const [low, high] = orderPair(userAId, userBId);
    await pool.query(
        `UPDATE matches SET status = 'unmatched' WHERE user_low_id = $1 AND user_high_id = $2 AND status = 'active'`,
        [low, high]
    );
}

module.exports = { isMatched, ensureMatch, unmatch, orderPair };
