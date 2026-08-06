const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const countriesRoutes = require("./routes/countries");
const profileRoutes = require("./routes/profile");
const notificationsRoutes = require("./routes/notifications");
const nationalitiesRoutes = require("./routes/nationalities");
const favoritesRoutes = require("./routes/favorites");

const app = express();

app.use(
  cors({
    origin: [
      "https://life-partner-website-in8u.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/nationalities", nationalitiesRoutes);
app.use("/api/favorites", favoritesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});