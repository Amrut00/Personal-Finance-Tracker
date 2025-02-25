import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./middleware/passport.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'], 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-v1", router);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
