import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../libs/database.js";
import { OAuth2Client } from "google-auth-library";
import { hashPassword } from "../libs/index.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createJWT = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const signupUser = async (req, res) => {
    try {
      const { firstname, email, password} = req.body;
  
      if (!firstname || !email || !password) {
        return res.status(400).json({ status: "failed", message: "All fields are required." });
      }
  
      const existingUser = await pool.query("SELECT * FROM tbluser WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ status: "failed", message: "User already exists." });
      }
  
      const hashedPassword = await hashPassword(password);
  
      await pool.query(
        `INSERT INTO tbluser (firstname, email, password) 
         VALUES ($1, $2, $3)`,
        [firstname, email, hashedPassword]
      );
  
      res.status(201).json({ status: "success", message: "User registered successfully." });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  

export const signinUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM tbluser WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ status: "failed", message: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ status: "failed", message: "Invalid credentials." });
    }

    const token = createJWT(user.rows[0].id);

    res.status(200).json({
      status: "success",
      user: user.rows[0],
      token,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ status: "failed", message: "Signin failed." });
  }
};

export const googleSignIn = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: google_uid, email, name } = ticket.getPayload();

    let user = await pool.query("SELECT * FROM tbluser WHERE google_uid = $1", [google_uid]);

    if (user.rows.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO tbluser (firstname, email, google_uid, provider, verified) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, email, google_uid, "google", true]
      );
      user = newUser;
    }

    const jwtToken = createJWT(user.rows[0].id);

    res.status(200).json({
      status: "success",
      user: user.rows[0],
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(500).json({ status: "failed", message: "Google sign-in failed." });
  }
};
