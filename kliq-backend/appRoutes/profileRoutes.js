import express from "express";
import User from '../authModels/authModels.js';  // Make sure the .js extension is included

const router = express.Router();

// Fetch profile by unique ID
router.get("/", async (req, res) => {
  const { uniqueId } = req.query;

  if (!uniqueId) {
    return res.status(400).json({ error: "Unique ID is required." });
  }

  try {
    // Fetch user or recipient by unique ID
    const user = await User.findOne({
      $or: [{ userId: uniqueId }, { recipientId: uniqueId }],
    });

    if (!user) {
      return  user;
    }

    // Construct response based on the role
    if (user.role === "user") {
      return res.json({
        name: user.name,
        age: user.age,
        bloodType: user.bloodType,
        userId: user.userId,
        

      });
    } else if (user.role === "recipient") {
      return res.json({
        name: user.name,
        age: user.age,
        role: user.role,
        recipientId: user.recipientId,
      });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
