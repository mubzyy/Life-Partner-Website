const pool = require("../db");

const SORTABLE = { joined: "u.created_at", name: "u.first_name" };

// Real, paginated, filterable user list for the CRM — same shape of query
// as /api/search, just admin-scoped (sees is_active, verified, plan, etc.
// that a regular user's search results never expose).
async function listUsers({ search, status, plan, page, limit }) {
    const conditions = [];
    const params = [];
    let i = 1;

    if (search) {
        conditions.push(`(
            (u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i}
            OR u.email ILIKE $${i}
            OR up.city ILIKE $${i}
        )`);
        params.push(`%${search}%`);
        i++;
    }
    if (status === "Active") conditions.push(`u.is_active = true`);
    if (status === "Inactive") conditions.push(`u.is_active = false`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Plan filter needs the joined current-plan-name subquery, so it's
    // applied after the fact via HAVING-style filtering in the outer query.
    const baseQuery = `
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN LATERAL (
            SELECT p.name AS plan_name
            FROM subscriptions s
            JOIN subscription_plans p ON p.id = s.plan_id
            WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
            ORDER BY s.ends_at DESC LIMIT 1
        ) sub ON true
        ${whereClause}
    `;

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(
        `SELECT
            u.id, u.first_name, u.last_name, u.email, u.phone_code, u.phone_number,
            u.email_verified, u.is_active, u.created_at,
            up.profile_photo_url AS image, up.city, up.state,
            COALESCE(sub.plan_name, 'Free') AS plan
         ${baseQuery}
         ORDER BY u.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );

    let rows = result.rows;
    if (plan && plan !== "All") {
        rows = rows.filter(r => r.plan === plan);
    }

    return { rows, total };
}

async function getUserById(userId) {
    const result = await pool.query(
        `SELECT
            u.id, u.first_name, u.last_name, u.email, u.phone_code, u.phone_number,
            u.email_verified, u.is_active, u.created_at, u.last_login,
            up.profile_photo_url AS image, up.city, up.state,
            COALESCE(sub.plan_name, 'Free') AS plan
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN LATERAL (
            SELECT p.name AS plan_name
            FROM subscriptions s
            JOIN subscription_plans p ON p.id = s.plan_id
            WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
            ORDER BY s.ends_at DESC LIMIT 1
         ) sub ON true
         WHERE u.id = $1`,
        [userId]
    );
    return result.rows[0] || null;
}

// Admin-created account: real row, real bcrypt-hashed password, skips the
// OTP step (the admin is vouching for this account directly) but is
// otherwise identical to a self-registered one — same UNIQUE constraints on
// email and (phone_code, phone_number) apply, so this can throw a real
// 23505 the same way signup does.
async function createUser({ first_name, last_name, email, country_id, phone_code, phone_number, hashedPassword, city }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const inserted = await client.query(
            `INSERT INTO users (first_name, last_name, email, country_id, phone_code, phone_number, password, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
            [first_name, last_name, email, country_id || null, phone_code || null, phone_number || null, hashedPassword]
        );
        const userId = inserted.rows[0].id;
        if (city) {
            await client.query(
                `INSERT INTO user_profiles (user_id, city) VALUES ($1, $2)
                 ON CONFLICT (user_id) DO UPDATE SET city = EXCLUDED.city`,
                [userId, city]
            );
        }
        await client.query("COMMIT");
        return userId;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function updateUser(userId, { first_name, last_name, email, phone_code, phone_number, city }) {
    const setClauses = [];
    const values = [];
    let i = 1;
    const fields = { first_name, last_name, email, phone_code, phone_number };
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
            setClauses.push(`${key} = $${i++}`);
            values.push(value);
        }
    }
    if (setClauses.length > 0) {
        setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        await pool.query(`UPDATE users SET ${setClauses.join(", ")} WHERE id = $${i}`, values);
    }
    if (city !== undefined) {
        await pool.query(
            `INSERT INTO user_profiles (user_id, city) VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET city = EXCLUDED.city, updated_at = CURRENT_TIMESTAMP`,
            [userId, city]
        );
    }
    return getUserById(userId);
}

// Used for both "Deactivate" (replaces the mock CRM's destructive "Delete")
// and "Activate" — is_active is the one real on/off switch, same column the
// user's own self-deactivation flow uses.
async function setActive(userId, isActive) {
    const result = await pool.query(
        "UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, is_active",
        [isActive, userId]
    );
    return result.rows[0] || null;
}

// Real, paginated profile list for the CRM Profiles page — the actual
// user_profiles rows, joined with real per-user preferred-country counts so
// calculateCompletion (server/lib/profileCompletion.js) can score them
// exactly the same way Complete Profile / the user's own dashboard does.
async function listProfiles({ search, page, limit }) {
    const conditions = ["up.user_id IS NOT NULL"];
    const params = [];
    let i = 1;
    if (search) {
        conditions.push(`(u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i++}`);
        params.push(`%${search}%`);
    }
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const baseQuery = `FROM users u JOIN user_profiles up ON up.user_id = u.id ${whereClause}`;
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(
        `SELECT
            u.id, u.first_name, u.last_name,
            up.*,
            (SELECT COUNT(*) FROM user_preferred_countries pc WHERE pc.user_id = u.id) AS partner_country_count
         ${baseQuery}
         ORDER BY u.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );
    return { rows: result.rows, total };
}

module.exports = { listUsers, getUserById, createUser, updateUser, setActive, listProfiles };
