// This is the Review model — stores customer reviews for listings.
// Reviews have a status (pending/approved/hidden) so agents can moderate them.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Review = sequelize.define(
  "Review",
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
    travellerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.STRING, // e.g., 'package', 'room'
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending", // pending, approved, hidden
      validate: { isIn: [["pending", "approved", "hidden"]] },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Reviews",
  },
);

module.exports = Review;
