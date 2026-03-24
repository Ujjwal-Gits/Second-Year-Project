// This is the Follower model — tracks which travellers are following which agents.
// Used to show follower counts on agent profiles and personalize content.

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Follower = sequelize.define(
  "Follower",
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
    travellerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Followers",
  },
);

module.exports = Follower;
