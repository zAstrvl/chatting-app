import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const register = async (req, res) => {
  const { fullName, email, passWord } = req.body;
  try {

    if (!fullName || !email || !passWord) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (passWord.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({email});

    if (user)
      return res.status(400).json({ message: "User with this email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassWord = await bcrypt.hash(passWord, salt);

    const newUser = new User({
      fullName,
      email,
      passWord: hashedPassWord
    });
    
    if (newUser)
    {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        message: "User registered successfully"
      });
    }
    else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error){
    console.log("Error in sign up controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = (req, res) => {
  res.send("User logged in");
};

export const logout = (req, res) => {
  res.send("User logged out");
};
