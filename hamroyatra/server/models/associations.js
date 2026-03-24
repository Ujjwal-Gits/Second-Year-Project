// This is the associations file — it wires up all the relationships between models (like foreign keys).
// Must be called once at server startup before any DB queries run.
// Example: Agent has many Listings, Listing belongs to Agent, etc.

const HamroAgent = require("./Agent");
const Listing = require("./Listing");
const Follower = require("./Follower");
const HamroTraveller = require("./Traveller");
const Review = require("./Review");
const Message = require("./Message");
const UserPreference = require("./UserPreference");
const Booking = require("./Booking");
const ListingView = require("./ListingView");

const setupAssociations = () => {
  // Agent and Listing
  HamroAgent.hasMany(Listing, { foreignKey: "agentId", as: "listings" });
  Listing.belongsTo(HamroAgent, { foreignKey: "agentId", as: "agent" });

  // Booking and Listing (for preference building)
  if (!Booking.associations.listing) {
    Booking.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });
    Listing.hasMany(Booking, { foreignKey: "listingId", as: "bookings" });
  }

  // Agent and Follower
  HamroAgent.hasMany(Follower, { foreignKey: "agentId", as: "followers" });
  Follower.belongsTo(HamroAgent, { foreignKey: "agentId", as: "agent" });

  // Traveller and Follower
  HamroTraveller.hasMany(Follower, {
    foreignKey: "travellerId",
    as: "following",
  });
  Follower.belongsTo(HamroTraveller, {
    foreignKey: "travellerId",
    as: "traveller",
  });

  // Listing and Review
  Listing.hasMany(Review, { foreignKey: "listingId", as: "reviews" });
  Review.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

  // Traveller and Review
  HamroTraveller.hasMany(Review, { foreignKey: "travellerId", as: "reviews" });
  Review.belongsTo(HamroTraveller, {
    foreignKey: "travellerId",
    as: "traveller",
  });

  // Agent and Guide
  const Guide = require("./Guide");
  HamroAgent.hasMany(Guide, { foreignKey: "agentId", as: "guides" });
  Guide.belongsTo(HamroAgent, { foreignKey: "agentId", as: "agent" });

  // Notifications
  const Notification = require("./Notification");
  HamroAgent.hasMany(Notification, {
    foreignKey: "agentId",
    as: "notifications",
  });
  Notification.belongsTo(HamroAgent, { foreignKey: "agentId", as: "agent" });
  HamroTraveller.hasMany(Notification, {
    foreignKey: "travellerId",
    as: "notifications",
  });
  Notification.belongsTo(HamroTraveller, {
    foreignKey: "travellerId",
    as: "traveller",
  });
};

module.exports = setupAssociations;
