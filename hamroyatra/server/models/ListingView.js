const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Tracks every listing view — used for real-time preference inference.
// sessionId is a random UUID stored in the browser (works for guests too).
const ListingView = sequelize.define(
  "ListingView",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sessionId: {
      // Browser-generated UUID, persisted in localStorage
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      // null for guests
      type: DataTypes.UUID,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Snapshot of listing attributes at view time — for similarity scoring
    listingType: { type: DataTypes.STRING, allowNull: true },
    listingLocation: { type: DataTypes.STRING, allowNull: true },
    listingTags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    listingDifficulty: { type: DataTypes.STRING, allowNull: true },
    listingPrice: { type: DataTypes.FLOAT, allowNull: true },
    viewCount: {
      // How many times this session viewed this listing
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    tableName: "ListingViews",
    indexes: [
      { fields: ["sessionId"] },
      { fields: ["userId"] },
      { fields: ["listingId"] },
    ],
  },
);

module.exports = ListingView;
