const express = require("express");
const router = express.Router();
const HamroAgent = require("../models/Agent");
const Listing = require("../models/Listing");
const Follower = require("../models/Follower");
const Review = require("../models/Review");
const Guide = require("../models/Guide");

// Get public profile of an agent
// If the requested agent is a sub-agent, transparently return the parent's profile
router.get("/:id", async (req, res) => {
  try {
    // First fetch the requested agent to check if it's a sub-agent
    const requested = await HamroAgent.findByPk(req.params.id, {
      attributes: ["id", "parentAgentId"],
    });
    if (!requested) return res.status(404).json({ error: "Agent not found" });

    // Resolve to the root owner
    const effectiveId = requested.parentAgentId || requested.id;

    const agent = await HamroAgent.findByPk(effectiveId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Listing,
          as: "listings",
          where: { isActive: true },
          required: false,
        },
        {
          model: Follower,
          as: "followers",
          required: false,
        },
        {
          model: Guide,
          as: "guides",
          required: false,
        },
      ],
    });

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Follow an agent
router.post("/:id/follow", async (req, res) => {
  try {
    const { travellerId } = req.body; // In a real app, get this from auth middleware
    if (!travellerId)
      return res.status(400).json({ error: "Traveller ID required" });

    const agentId = req.params.id;

    const existingFollow = await Follower.findOne({
      where: { agentId, travellerId },
    });

    if (existingFollow) {
      await existingFollow.destroy();
      return res.json({ message: "Unfollowed successfully", following: false });
    }

    await Follower.create({ agentId, travellerId });
    res.json({ message: "Followed successfully", following: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if following
router.get("/:id/is-following/:travellerId", async (req, res) => {
  try {
    const { id: agentId, travellerId } = req.params;
    const follow = await Follower.findOne({
      where: { agentId, travellerId },
    });
    res.json({ following: !!follow });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
