import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

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

export const login = async (req, res) => {
  const { email, passWord } = req.body;

  if (!email || !passWord) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.passWord) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isCorrect = await bcrypt.compare(passWord, user.passWord);

    if (!isCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      message: "User logged in successfully"
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0) });
    res.status(200).json({ message: "User logged out successfully" });
  }
  catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try{
    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic)
      return res.status(400).json({ message: "Profile picture is required" });


    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(userId, {
      profilePicture: uploadResponse.secure_url
    }, { new: true });

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      message: "Profile updated successfully"
    });
  }
  catch (error) {
    console.log("Error in update profile controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkRoute = (req, res) => {
  try{
    res.status(200).json({ message: "User is authenticated" });
  }
  catch (error) {
    console.log("Error in check route controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};