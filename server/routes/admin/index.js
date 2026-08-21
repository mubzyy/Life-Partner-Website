const express = require("express");
const router = express.Router();
const adminSessionAuth = require("../../middleware/adminSessionAuth");

// EVERY route under /api/admin passes through this — the real security
// boundary for the whole CRM. It verifies an admin JWT (signed with
// ADMIN_JWT_SECRET, completely separate from customer JWTs) and re-checks
// the admins table fresh on every request. A customer's token can never
// pass here at all, regardless of what URL they guess or what the frontend
// does or doesn't show — it's signed with a different secret entirely.
router.use(adminSessionAuth);

router.use("/dashboard", require("./dashboard"));
router.use("/users", require("./users"));
router.use("/profiles", require("./profiles"));
router.use("/verifications", require("./verifications"));
router.use("/subscriptions", require("./subscriptions"));
router.use("/payments", require("./payments"));
router.use("/reports", require("./reports"));
router.use("/settings", require("./settings"));
router.use("/notifications", require("./notifications"));

module.exports = router;
