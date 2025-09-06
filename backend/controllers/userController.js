import { User } from "../database/mongo-schema.js";
import { comparePassword, hashPassword } from "../libs/index.js";

export const getUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found." });
    }

    user.password = undefined;

    res.status(201).json({
      status: "success",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        status: "failed",
        message: "New Passwords does not match.",
      });
    }

    const isMatch = await comparePassword(currentPassword, user?.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "failed", message: "Invalid current password." });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstname, lastname, email, contact, country, currency } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found." });
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.contact = contact || "";
    user.country = country || "";
    user.currency = currency || "INR";
    await user.save();

    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "User information updated successfully",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        contact: user.contact,
        country: user.country,
        currency: user.currency
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};