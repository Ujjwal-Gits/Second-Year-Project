const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Stores learned preferences per user (traveller or agent browsing).
// Built from booking history + explicit signals (wishlist, search terms).
const UserPreference = sequelize.define(
  "UserPreference",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userRole: {
      // 'traveller' | 'agent'
      type: DataTypes.STRING,
      defaultValue: "traveller",
    },
    // Preferred listing types derived from booking history
    preferredTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // Preferred difficulty levels
    preferredDifficulties: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // Preferred tags (adventure, family, luxury, etc.)
    preferredTags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // Preferred locations
    preferredLocations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // Budget range learned from bookings
    avgSpend: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    // Number of bookings used to compute this profile
    sampleSize: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "UserPreferences",
  },
);

module.exports = UserPreference;
