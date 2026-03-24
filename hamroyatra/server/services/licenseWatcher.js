// This background service checks if any guide's trekking license is expiring within 30 days.
// If so, it creates a notification for the agent. It runs on server startup and every 24 hours.
// Alerts are sent at most once per week per guide to avoid spam.

const Guide = require("../models/Guide");
const Notification = require("../models/Notification");
const { Op } = require("sequelize");

const checkLicenseExpiries = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringGuides = await Guide.findAll({
      where: {
        certificateExpiry: {
          [Op.lte]: thirtyDaysFromNow,
        },
        [Op.or]: [
          { lastAlertSent: null },
          {
            lastAlertSent: {
              [Op.lt]: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          }, // Alert once a week
        ],
      },
    });

    for (const guide of expiringGuides) {
      const isExpired = new Date(guide.certificateExpiry) < new Date();
      const title = isExpired
        ? "Guide License Expired"
        : "Guide License Expiring Soon";
      const msg = isExpired
        ? `License for ${guide.fullName} has expired. Profile badge has been revoked.`
        : `License for ${guide.fullName} expires on ${guide.certificateExpiry}. Please renew to prevent badge revocation.`;

      await Notification.create({
        agentId: guide.agentId,
        companyName: guide.companyName,
        type: "alert",
        title: title,
        message: msg,
      });

      guide.lastAlertSent = new Date();
      await guide.save();
      console.log(`[LICENSE ALERT] Sent for guide: ${guide.fullName}`);
    }
  } catch (err) {
    console.error("License watcher error:", err.message);
  }
};

module.exports = checkLicenseExpiries;
