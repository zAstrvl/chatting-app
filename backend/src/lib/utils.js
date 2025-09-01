import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { 
    maxAge: 3600000, // 1 hour
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
});
    return token;
};
