import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.COOKIE_SECURE === "true",
  path: "/",
});

export async function requireAuth(req, res, next) {
  let payload;
  try {
    payload = jwt.verify(req.cookies.session || "", process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({ message: "Please log in to continue." });
  }
  const user = await User.findById(payload.sub);
  if (!user || payload.version !== user.sessionVersion)
    return res
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
  req.user = user;
  next();
}

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export function signIn(res, user) {
  const token = jwt.sign(
    { version: user.sessionVersion },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: "1d", algorithm: "HS256" },
  );
  res.cookie("session", token, { ...cookieOptions(), maxAge: 86400000 });
}
