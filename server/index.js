const express = require("express");
const cors = require("cors");
// Load .env.local first (local dev override), then fall back to .env
require("dotenv").config({ path: ".env.local", override: false });
require("dotenv").config();
const { UPLOADS_ROOT } = require("./middleware/upload");


const authRoutes = require("./routes/auth");
const countriesRoutes = require("./routes/countries");
const profileRoutes = require("./routes/profile");
const notificationsRoutes = require("./routes/notifications");
const nationalitiesRoutes = require("./routes/nationalities");
const favoritesRoutes = require("./routes/favorites");
const matchesRoutes = require("./routes/matches");
const searchRoutes = require("./routes/search");
const interactionsRoutes = require("./routes/interactions");
const visitorsRoutes = require("./routes/visitors");
const messagesRoutes = require("./routes/messages");
const settingsRoutes = require("./routes/settings");
const blocksRoutes = require("./routes/blocks");
const subscriptionsRoutes = require("./routes/subscriptions");
const dashboardRoutes = require("./routes/dashboard");
const accountRoutes = require("./routes/account");
const supportRoutes = require("./routes/support");
const reportsRoutes = require("./routes/reports");

const app = express();

app.use(
  cors({
    origin: [
      "https://life-partner-website-in8u.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// Serve locally-stored uploads (profile photos, etc.) as static files.
app.use("/uploads", express.static(UPLOADS_ROOT));

app.use("/api/auth", authRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/nationalities", nationalitiesRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/blocks", blocksRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportsRoutes);

// Generic error handler — must be registered last, after every route. Without
// this, Express's default handler sends the raw error (stack trace, internal
// file paths, dependency internals) as the HTTP response body for anything
// that throws before reaching a route's own try/catch — e.g. malformed JSON
// or an oversized body, both rejected by body-parser before any route runs.
// The real error is still logged server-side; the client only ever sees a
// generic message.
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err.type === "entity.too.large" || err.status === 413) {
        return res.status(413).json({ message: "Request body is too large." });
    }
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ message: "Malformed request body." });
    }
    res.status(err.status || 500).json({ message: "Server error." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});