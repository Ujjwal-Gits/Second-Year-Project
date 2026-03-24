// This is the ActivityLog model — records every important action taken by agents or travellers.
// Used in the super admin dashboard to audit what's happening across the platform.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    travellerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    travellerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING, // e.g., 'CREATE_LISTING', 'DELETE_AGENT', etc.
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING, // Description of the action
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID, // ID of the affected item (listing, agent, guide, etc.)
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "ActivityLogs",
  },
);

module.exports = ActivityLog;
