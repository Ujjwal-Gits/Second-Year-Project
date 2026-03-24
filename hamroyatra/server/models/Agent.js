// This is the Agent model — represents travel agencies and trekking companies on the platform.
// Agents can create listings, manage bookings, add guides, and get verified by the admin.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const HamroAgent = sequelize.define(
  "HamroAgent",
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
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "agent",
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    legalCompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyOwner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerContactNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    citizenshipImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceTypes: {
      type: DataTypes.JSON, // ['hotel', 'travel', 'trekking']
      allowNull: true,
    },
    citizenshipNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    citizenshipDistrict: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    citizenshipIssueDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.STRING, // 'pending', 'verified', 'rejected'
      defaultValue: "pending", // Default as pending when they register as partner
    },
    parentAgentId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    tableName: "HamroAgents",
  },
);

module.exports = HamroAgent;
