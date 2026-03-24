// This is the Traveller model — represents regular users who browse and book trips on HamroYatra.
// Travellers can save bookmarks, store itineraries, and write reviews.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const HamroTraveller = sequelize.define(
  "HamroTraveller",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // null for Google OAuth users
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "traveller",
    },
    bookmarks: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    savedItineraries: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Google OAuth fields — null for email/password users
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.STRING,
      defaultValue: "local", // 'local' | 'google'
    },
  },
  {
    timestamps: true,
    tableName: "HamroTravellers",
  },
);

module.exports = HamroTraveller;
