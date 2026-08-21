const bcrypt = require("bcrypt");
const crypto = require("crypto");
const adminUserModel = require("../models/adminUserModel");
const subscriptionModel = require("../models/subscriptionModel");
const { calculateCompletion } = require("../lib/profileCompletion");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function shapeUser(row) {
    return {
        id: row.id,
        name: `${row.first_name} ${row.last_name || ""}`.trim(),
        email: row.email,
        phone: row.phone_code && row.phone_number ? `${row.phone_code}${row.phone_number}` : "Not specified",
        city: row.city ? `${row.city}${row.state ? ", " + row.state : ""}` : "Not specified",
        image: row.image || null,
        plan: row.plan,
        status: row.is_active ? "Active" : "Inactive",
        verified: row.email_verified,
        joined: row.created_at,
    };
}

// GET /api/admin/users
async function getUsers(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const { search, status, plan } = req.query;

        const { rows, total } = await adminUserModel.listUsers({ search, status, plan, page, limit });
        res.json({ results: rows.map(shapeUser), total, page, limit, hasNextPage: (page - 1) * limit + rows.length < total });
    } catch (err) {
        console.error("Error fetching admin users:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/users/:id
async function getUser(req, res) {
    try {
        const user = await adminUserModel.getUserById(Number(req.params.id));
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(shapeUser(user));
    } catch (err) {
        console.error("Error fetching admin user:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/admin/users — admin-created account, skips OTP (the admin is
// vouching for it), real bcrypt-hashed random password (they can use
// "Forgot password" to set a real one, same as a Google-created account).
async function createUser(req, res) {
    try {
        const { first_name, last_name, email, phone_code, phone_number, city, country_id } = req.body;
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ message: "Name and email are required." });
        }
        const randomPassword = crypto.randomBytes(24).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const userId = await adminUserModel.createUser({
            first_name, last_name, email, country_id, phone_code, phone_number, hashedPassword, city,
        });
        const user = await adminUserModel.getUserById(userId);
        res.status(201).json(shapeUser(user));
    } catch (err) {
        if (err.code === "23505") {
            if (err.constraint === "users_phone_code_phone_number_key") {
                return res.status(400).json({ message: "An account with this phone number already exists." });
            }
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        console.error("Error creating admin user:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
    try {
        const userId = Number(req.params.id);
        const { first_name, last_name, email, phone_code, phone_number, city, plan } = req.body;

        const updated = await adminUserModel.updateUser(userId, { first_name, last_name, email, phone_code, phone_number, city });
        if (!updated) return res.status(404).json({ message: "User not found." });

        if (plan !== undefined) {
            if (plan === "Free" || plan === "") {
                await subscriptionModel.removeActivePlan(userId);
            } else {
                const plans = await subscriptionModel.getAllPlansAdmin();
                const targetPlan = plans.find(p => p.name === plan);
                if (!targetPlan) return res.status(400).json({ message: `Unknown plan: ${plan}` });
                await subscriptionModel.adminAssignPlan(userId, targetPlan.id, req.admin.id);
            }
        }

        const full = await adminUserModel.getUserById(userId);
        res.json(shapeUser(full));
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ message: "An account with this email or phone number already exists." });
        }
        console.error("Error updating admin user:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/admin/users/:id/deactivate — replaces the mock CRM's destructive
// "Delete User". Real, reversible: is_active = false, same switch the
// user's own account-deactivation flow uses.
async function deactivateUser(req, res) {
    try {
        const result = await adminUserModel.setActive(Number(req.params.id), false);
        if (!result) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User deactivated.", is_active: false });
    } catch (err) {
        console.error("Error deactivating admin user:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/admin/users/:id/activate
async function activateUser(req, res) {
    try {
        const result = await adminUserModel.setActive(Number(req.params.id), true);
        if (!result) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User activated.", is_active: true });
    } catch (err) {
        console.error("Error activating admin user:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/profiles
async function getProfiles(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const { search } = req.query;

        const { rows, total } = await adminUserModel.listProfiles({ search, page, limit });
        const results = rows.map(row => {
            let age = null;
            if (row.date_of_birth) {
                const diff = Date.now() - new Date(row.date_of_birth).getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
            const completion = calculateCompletion(row, parseInt(row.partner_country_count, 10) || 0);
            return {
                id: row.id,
                name: `${row.first_name} ${row.last_name || ""}`.trim(),
                image: row.profile_photo_url || null,
                city: row.city || "Not specified",
                age: age || "N/A",
                height: row.height || "Not specified",
                religion: row.religion || "Not specified",
                education: row.education || "Not specified",
                profession: row.occupation || "Not specified",
                maritalStatus: row.marital_status || "Not specified",
                profileComplete: completion.profileCompletion,
            };
        });

        res.json({ results, total, page, limit, hasNextPage: (page - 1) * limit + rows.length < total });
    } catch (err) {
        console.error("Error fetching admin profiles:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getUsers, getUser, createUser, updateUser, deactivateUser, activateUser, getProfiles };
