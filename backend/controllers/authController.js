import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { publicUser, signIn, cookieOptions } from "../middleware/auth.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 60 ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({
      message:
        "Enter a name, valid email, and password of at least 8 characters (maximum 72 bytes).",
    });
  }
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
  });
  signIn(res, user);
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    Buffer.byteLength(password) > 72
  )
    return res.status(400).json({ message: "Enter your email and password." });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+passwordHash",
  );
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: "Incorrect email or password." });
  signIn(res, user);
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  // Incrementing the version revokes existing JWTs, including copied cookies.
  await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie("session", cookieOptions()).json({ message: "Logged out." });
}

export function getCurrentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}
