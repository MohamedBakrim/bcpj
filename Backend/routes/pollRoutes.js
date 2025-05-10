// pollRoutes.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create a poll
router.post("/create-poll", async (req, res) => {
  try {
    const { title, options, startTime, endTime } = req.body;

    // Insert poll into the polls table
    const [pollResult] = await pool.query(
      "INSERT INTO polls (title, startTime, endTime) VALUES (?, ?, ?)",
      [title, startTime, endTime]
    );
    const pollId = pollResult.insertId;

    // Insert options into the options table
    for (let option of options) {
      await pool.query(
        "INSERT INTO options (poll_id, name) VALUES (?, ?)",
        [pollId, option]
      );
    }

    res.status(201).json({ message: "Poll created!", pollId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating poll." });
  }
});

// Get all polls with their options
router.get("/", async (req, res) => {
  try {
    const [polls] = await pool.query("SELECT * FROM polls");
    const detailed = [];

    for (let poll of polls) {
      const [opts] = await pool.query(
        "SELECT id AS optionId, name FROM options WHERE poll_id = ?",
        [poll.id]
      );
      detailed.push({
        id: poll.id,
        title: poll.title,
        startTime: poll.startTime,
        endTime: poll.endTime,
        options: opts
      });
    }

    res.json(detailed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching polls." });
  }
});

// Record a vote in the database
router.post("/vote", async (req, res) => {
  try {
    const { pollId, optionIndex, voter, votedAt } = req.body;
    await pool.query(
      "INSERT INTO votes (poll_id, option_index, voter, voted_at) VALUES (?, ?, ?, ?)",
      [pollId, optionIndex, voter, votedAt]
    );
    res.status(201).json({ message: "Vote recorded in database!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error recording vote." });
  }
});

export default router;
