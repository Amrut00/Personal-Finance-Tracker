import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { hashPassword } from "../libs/index.js";
import { User } from "../database/mongo-schema.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createJWT = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const signupUser = async (req, res) => {
    try {
      const { firstname, lastname, email, password } = req.body;
  
      if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ 
          status: "failed", 
          message: "All fields are required: firstname, lastname, email, and password" 
        });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ status: "failed", message: "User already exists." });
      }
  
      const hashedPassword = await hashPassword(password);
  
      const user = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword
      });
      await user.save();

      const token = createJWT(user._id);
      
      res.status(201).json({ 
        status: "success", 
        message: "User registered successfully.",
        token,
        user: {
          id: user._id,
          firstname: user.firstname,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const token = createJWT(user._id);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ status: "failed", message: "Signin failed." });
  }
};

export const googleSignIn = async (req, res) => {
  const { token, clientId } = req.body;

  if (!token) {
    return res.status(400).json({ 
      status: "failed", 
      message: "No token provided" 
    });
  }

  try {
    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: google_uid, email, name, picture } = ticket.getPayload();
    
    if (!email) {
      throw new Error('No email found in Google profile');
    }

    // Check if user exists by email or googleId
    let user = await User.findOne({ 
      $or: [
        { googleId: google_uid },
        { email: email.toLowerCase() }
      ]
    });

    if (!user) {
      // Extract first and last name from Google's name
      const nameParts = name ? name.split(' ') : [email.split('@')[0], ''];
      const firstname = nameParts[0] || email.split('@')[0];
      const lastname = nameParts.slice(1).join(' ') || 'User';
      
      // Create new user with Google OAuth data
      user = new User({
        firstname: firstname,
        lastname: lastname,
        email: email.toLowerCase(),
        googleId: google_uid,
        provider: "google",
        verified: true,
        avatar: picture || '',
        // Generate a random password for social logins (won't be used)
        password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 10)
      });
      
      await user.save();
    } else if (!user.googleId) {
      // If user exists but doesn't have googleId, update it
      user.googleId = google_uid;
      user.verified = true;
      await user.save();
    }

    const jwtToken = createJWT(user._id);

    res.status(200).json({
      status: "success",
      message: "Google sign-in successful",
      token: jwtToken,
      user: {
        id: user._id,
        firstname: user.firstname,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message || "Google sign-in failed",
      code: error.code
    });
  }
};
