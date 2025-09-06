import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import router from "./routes/index.js";
import connectDB from "./libs/database.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        status: "error",
        message: "Internal Server Error"
    });
});

// Add unhandled promise rejection handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add uncaught exception handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// ✅ CORS Policy - Support both local and production
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:3000',  // Alternative local port
  process.env.FRONTEND_URL, // Production frontend URL
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null, // Vercel preview URLs
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel preview URLs
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow Netlify URLs
    if (origin && origin.includes('.netlify.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 3600
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
