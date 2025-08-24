const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const path = require("path");
const dbcon = require("./app/config/dbcon");
const adminRoutes = require("./app/routes/admin");
const authRoutes = require("./app/routes/authroutes");
const songRoutes = require("./app/routes/songroutes");
const musicRoutes = require("./app/routes/musicroutes");
const User = require("./app/models/user");
require("dotenv").config();

// -------------------- DB Connect --------------------
dbcon();

// -------------------- Allowed Origins --------------------
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3005", // ✅ local dev frontend
  "https://mern-music-web.vercel.app",
  "https://www.mern-music-web.vercel.app"
];

// -------------------- CORS --------------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (public + uploads)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Sessions --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.mongodb_url }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // only secure in prod
    },
  })
);

// -------------------- View Engine --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- Routes --------------------
app.use("/admin", adminRoutes);
app.use(authRoutes);
app.use("/songs", songRoutes);
app.use("/", musicRoutes);

// -------------------- Auth Helpers --------------------
app.get("/api/me", async (req, res) => {
  console.log("Session:", req.session);
  if (!req.session?.user)
    return res.status(401).json({ error: "Not authenticated" });

  const dbUser = await User.findById(req.session.user._id);
  if (!dbUser) return res.status(404).json({ error: "User not found" });

  req.session.user.isSubscribed = dbUser.isSubscribed;
  req.session.user.subscriptionExpires = dbUser.subscriptionExpires;

  res.json({ user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    res.clearCookie("connect.sid", {
      path: "/",
      sameSite: "none",
      secure: true,
    });
    res.json({ message: "Logged out successfully" });
  });
});

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// -------------------- Server --------------------
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Server running at port ${PORT}`);
});
