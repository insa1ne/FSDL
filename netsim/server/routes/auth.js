import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Point it to your generated folder
// Import the single instance we already configured with the adapter
import { prisma } from "../prisma.ts"; // or "../prisma.js"

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed
      }
    });

    res.json({ message: "User created" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Step 1: Find user ONLY by unique field
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Step 2: Compare password separately
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // ✅ Step 3: Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;