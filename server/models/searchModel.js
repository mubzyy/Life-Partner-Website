const pool = require("../db");

const SORT_CLAUSES = {
    recent: "u.created_at DESC",
    oldest: "u.created_at ASC",
    age_asc: "up.date_of_birth DESC NULLS LAST",  // younger = more recent DOB
    age_desc: "up.date_of_birth ASC NULLS LAST",  // older = earlier DOB
};

// Builds the shared WHERE clause + params for both the COUNT and the
// paginated SELECT, so the reported total always matches what's actually
// being paged through. `filters` is the already-trusted (controller-parsed)
// filter object.
function buildWhere(userId, filters) {
    const { query: searchText, minAge, maxAge, gender, religion, sect, maritalStatus, city, profession } = filters;

    const conditions = [
        "u.id != $1",
        "u.is_active = true",
        "b.id IS NULL",
        `(
            COALESCE(us.profile_visibility, 'everyone') = 'everyone'
            OR (
                COALESCE(us.profile_visibility, 'everyone') = 'matches'
                AND EXISTS (
                    SELECT 1 FROM interactions i1
                    JOIN interactions i2 ON i1.actor_id = i2.target_id AND i1.target_id = i2.actor_id
                    WHERE i1.actor_id = $1 AND i1.target_id = u.id AND i1.action = 'like' AND i2.action = 'like'
                )
            )
        )`,
    ];
    const params = [userId];
    let i = 2;

    if (gender && gender !== "Any") {
        conditions.push(`up.gender = $${i++}`);
        params.push(gender);
    }
    if (religion && religion !== "Any") {
        conditions.push(`up.religion = $${i++}`);
        params.push(religion);
    }
    if (sect && sect !== "Any") {
        conditions.push(`up.sect = $${i++}`);
        params.push(sect);
    }
    if (maritalStatus && maritalStatus !== "Any") {
        conditions.push(`up.marital_status = $${i++}`);
        params.push(maritalStatus);
    }
    if (filters.education && filters.education !== "Any") {
        conditions.push(`up.education = $${i++}`);
        params.push(filters.education);
    }
    if (city) {
        conditions.push(`up.city ILIKE $${i++}`);
        params.push(`%${city}%`);
    }
    if (profession) {
        conditions.push(`up.occupation ILIKE $${i++}`);
        params.push(`%${profession}%`);
    }
    if (minAge) {
        conditions.push(`EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) >= $${i++}`);
        params.push(minAge);
    }
    if (maxAge) {
        conditions.push(`EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) <= $${i++}`);
        params.push(maxAge);
    }
    if (searchText && searchText.trim()) {
        conditions.push(`(
            (u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i}
            OR up.occupation ILIKE $${i}
        )`);
        params.push(`%${searchText.trim()}%`);
        i++;
    }

    const fromClause = `
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocked_id = $1 AND b.blocker_id = u.id)
        LEFT JOIN user_settings us ON us.user_id = u.id
        WHERE ${conditions.join(" AND ")}
    `;

    return { fromClause, params, nextParamIndex: i };
}

async function countResults(userId, filters) {
    const { fromClause, params } = buildWhere(userId, filters);
    const result = await pool.query(`SELECT COUNT(*) ${fromClause}`, params);
    return parseInt(result.rows[0].count, 10);
}

async function searchProfiles(userId, filters, sort, limit, offset) {
    const { fromClause, params, nextParamIndex: i } = buildWhere(userId, filters);
    const orderBy = SORT_CLAUSES[sort] || SORT_CLAUSES.recent;
    const dataParams = [...params, limit, offset];

    const result = await pool.query(
        `SELECT
            u.id, u.first_name, u.last_name,
            up.profile_photo_url as image,
            up.gender, up.date_of_birth, up.marital_status,
            up.city, up.state, up.nationality,
            up.occupation as profession, up.education,
            up.religion, up.sect, up.about_me,
            u.created_at, u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
            EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
            ) AS is_premium
         ${fromClause}
         ORDER BY is_premium DESC, ${orderBy}
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );
    return result.rows;
}

module.exports = { countResults, searchProfiles };
