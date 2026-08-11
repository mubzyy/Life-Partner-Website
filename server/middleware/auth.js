const jwt = require("jsonwebtoken");

/**
 * Auth middleware — reads JWT from the Authorization: Bearer <token> header.
 * The frontend stores the JWT in localStorage and must send it as a header.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
