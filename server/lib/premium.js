// Shared "is this user premium right now" check — the same real-time
// definition GET /api/subscriptions/me uses (an active subscription row
// whose ends_at hasn't passed), reused everywhere else premium status needs
// to be known so there's exactly one definition of "premium" in the app.

async function isUserPremium(pool, userId) {
    const result = await pool.query(
        `SELECT 1 FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
         LIMIT 1`,
        [userId]
    );
    return result.rows.length > 0;
}

// Batch version for list endpoints (search/matches) — one query instead of
// N, returns the subset of userIds that currently have an active subscription.
async function getPremiumUserIdSet(pool, userIds) {
    if (!userIds || userIds.length === 0) return new Set();
    const result = await pool.query(
        `SELECT DISTINCT user_id FROM subscriptions
         WHERE user_id = ANY($1::int[]) AND status = 'active' AND ends_at > CURRENT_TIMESTAMP`,
        [userIds]
    );
    return new Set(result.rows.map(r => r.user_id));
}

module.exports = { isUserPremium, getPremiumUserIdSet };
