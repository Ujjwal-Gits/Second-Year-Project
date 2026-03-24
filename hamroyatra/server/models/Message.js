// This is the Message model — stores contact/inquiry messages sent by travellers to agents.
// Messages have a read/unread/replied status so agents can manage their inbox.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    travellerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    senderRole: {
      type: DataTypes.STRING,
      defaultValue: "traveller",
      validate: { isIn: [["traveller", "agent"]] },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "unread",
      validate: { isIn: [["unread", "read", "replied"]] },
    },
  },
  {
    timestamps: true,
    tableName: "Messages",
  },
);

module.exports = Message;
