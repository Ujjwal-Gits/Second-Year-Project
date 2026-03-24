// This is the Guide model — represents trekking guides employed by agents.
// Each guide has a certificate with an expiry date. The license watcher monitors this and sends alerts.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Guide = sequelize.define(
  "Guide",
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
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certificateImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificateExpiry: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastAlertSent: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Guides",
  },
);

module.exports = Guide;
