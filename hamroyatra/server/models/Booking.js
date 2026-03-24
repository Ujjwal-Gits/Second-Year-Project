// This is the Booking model — stores all trip/room bookings made by travellers or agents.
// It tracks payment status, trip progress, guest details, and room selections.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    travellerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bookingType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["room", "package", "guide", "trekking", "travel", "hotel"]],
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    roomCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    roomType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roomSelection: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    guideName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    advanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      validate: { isIn: [["done", "pending"]] },
    },
    idType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otherIdType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "confirmed",
      validate: { isIn: [["confirmed", "pending", "cancelled", "completed"]] },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.ENUM("agent", "traveller"),
      defaultValue: "agent",
    },
    tripStatus: {
      type: DataTypes.ENUM("pending", "active", "completed"),
      defaultValue: "pending",
    },
    checklist: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "Bookings",
  },
);

module.exports = Booking;
