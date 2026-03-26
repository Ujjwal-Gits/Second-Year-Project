// Checks guide certificate expiries on startup and every 24h.
// Sends a notification to the agent if a guide's license expires within 30 days.
// Alerts at most once per week per guide to avoid spam.

const prisma = require("../config/prisma");

const checkLicenseExpiries = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expiringGuides = await prisma.guide.findMany({
      where: {
        certificateExpiry: { lte: thirtyDaysFromNow },
        OR: [{ lastAlertSent: null }, { lastAlertSent: { lt: sevenDaysAgo } }],
      },
    });

    for (const guide of expiringGuides) {
      const isExpired = new Date(guide.certificateExpiry) < new Date();
      await prisma.notification.create({
        data: {
          agentId: guide.agentId,
          companyName: guide.companyName,
          type: "alert",
          title: isExpired
            ? "Guide License Expired"
            : "Guide License Expiring Soon",
          message: isExpired
            ? `License for ${guide.fullName} has expired. Profile badge has been revoked.`
            : `License for ${guide.fullName} expires on ${guide.certificateExpiry.toISOString().split("T")[0]}. Please renew.`,
        },
      });
      await prisma.guide.update({
        where: { id: guide.id },
        data: { lastAlertSent: new Date() },
      });
      console.log(`[LICENSE ALERT] Sent for guide: ${guide.fullName}`);
    }
  } catch (err) {
    console.error("License watcher error:", err.message);
  }
};

module.exports = checkLicenseExpiries;
