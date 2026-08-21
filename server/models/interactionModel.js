const pool = require("../db");

async function isBlockedEitherWay(userAId, userBId) {
    const result = await pool.query(
        `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
        [userAId, userBId]
    );
    return result.rows.length > 0;
}

// Insert or update a like/pass. ON CONFLICT keeps a single row per
// (actor, target) pair — the actor's most recent action always wins.
async function recordInteraction(actorId, targetId, action) {
    const result = await pool.query(
        `INSERT INTO interactions (actor_id, target_id, action)
         VALUES ($1, $2, $3)
         ON CONFLICT (actor_id, target_id)
         DO UPDATE SET action = EXCLUDED.action, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [actorId, targetId, action]
    );
    return result.rows[0];
}

// Has targetId already liked actorId? (i.e. is this a mutual like)
async function hasLiked(actorId, targetId) {
    const result = await pool.query(
        `SELECT id FROM interactions WHERE actor_id = $1 AND target_id = $2 AND action = 'like'`,
        [actorId, targetId]
    );
    return result.rows.length > 0;
}

async function getFirstName(userId) {
    const result = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.first_name || null;
}

async function notifyNewMatch(actorId, targetId) {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, action_url)
        VALUES
        ($1, 'New Match!', 'You and a new user liked each other.', 'match', '/matches'),
        ($2, 'New Match!', 'You and a new user liked each other.', 'match', '/matches')
    `, [actorId, targetId]);
}

async function notifyNewLike(targetId, actorName) {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, action_url)
        VALUES ($1, 'New Like', $2, 'like', '/visitors')
    `, [targetId, `${actorName} liked your profile.`]);
}

module.exports = { isBlockedEitherWay, recordInteraction, hasLiked, getFirstName, notifyNewMatch, notifyNewLike };
