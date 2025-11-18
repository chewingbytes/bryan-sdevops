import express from "express";
import { readData, writeData } from "../../frontend/utils/data.js";

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
  const data = readData();
  res.json(data.users);
});

// Add new user
router.post("/", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const data = readData();
  if (!data.users.includes(username)) data.users.push(username);

  writeData(data);
  res.json({ success: true });
});

export default router;