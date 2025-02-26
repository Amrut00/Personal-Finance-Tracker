import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();

// ✅ Fix CORS Policy
app.use(cors({
  origin: [
      'http://localhost:5173', 
      'https://startling-capybara-a97502.netlify.app', 
      'https://finance-tracker-frontend-1111.vercel.app'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Initialize Passport (For Google OAuth)
app.use(passport.initialize());

// ✅ API Routes
app.use("/api-v1", router);

// ✅ 404 Fallback
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
