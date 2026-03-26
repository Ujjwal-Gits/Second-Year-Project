// Agent public profile, follow/unfollow

const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

// resolves sub-agents to their parent's profile
router.get("/:id", async (req, res) => {
  try {
    const requested = await prisma.hamroAgent.findUnique({
      where: { id: req.params.id },
      select: { id: true, parentAgentId: true },
    });
    if (!requested) return res.status(404).json({ error: "Agent not found" });

    const effectiveId = requested.parentAgentId || requested.id;

    const agent = await prisma.hamroAgent.findUnique({
      where: { id: effectiveId },
      omit: { password: true },
      include: {
        listings: { where: { isActive: true } },
        followers: true,
        guides: true,
      },
    });

    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Follow / unfollow an agent
router.post("/:id/follow", async (req, res) => {
  try {
    const { travellerId } = req.body;
    if (!travellerId)
      return res.status(400).json({ error: "Traveller ID required" });

    const agentId = req.params.id;
    const existing = await prisma.follower.findFirst({
      where: { agentId, travellerId },
    });

    if (existing) {
      await prisma.follower.delete({ where: { id: existing.id } });
      return res.json({ message: "Unfollowed successfully", following: false });
    }

    await prisma.follower.create({ data: { agentId, travellerId } });
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
    const follow = await prisma.follower.findFirst({
      where: { agentId, travellerId },
    });
    res.json({ following: !!follow });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
