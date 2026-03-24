// This is the Listing model — represents a hotel, trekking package, or travel package posted by an agent.
// It includes smart filtering fields (difficulty, seasons, tags) used by the AI recommendation engine.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Listing = sequelize.define(
  "Listing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("hotel", "trekking", "travel"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    offers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    totalRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    acRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nonAcRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    familyRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    coupleRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    itinerary: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    hotelCategory: {
      type: DataTypes.ENUM("hotel", "homestay"),
      defaultValue: "hotel",
    },
    acPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    nonAcPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    familyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    couplePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    // ── Smart Filtering Fields ──────────────────────────────
    difficulty: {
      // easy | moderate | hard | extreme
      type: DataTypes.ENUM("easy", "moderate", "hard", "extreme"),
      allowNull: true,
      defaultValue: null,
    },
    bestSeasons: {
      // e.g. ['spring', 'autumn']  — spring|summer|autumn|winter
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    tags: {
      // free-form tags: ['family', 'solo', 'adventure', 'luxury', 'budget', 'cultural', 'wildlife']
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    avgRating: {
      // denormalized average rating — updated on review create/delete
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "Listings",
  },
);

module.exports = Listing;
