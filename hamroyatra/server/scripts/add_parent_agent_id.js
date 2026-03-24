/**
 * Run once to add parentAgentId column to HamroAgents table.
 * Usage: node hamroyatra/server/scripts/add_parent_agent_id.js
 */
const { sequelize } = require("../config/db");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      ALTER TABLE "HamroAgents"
      ADD COLUMN IF NOT EXISTS "parentAgentId" UUID DEFAULT NULL;
    `);
    console.log("✓ parentAgentId column added (or already exists).");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
})();
