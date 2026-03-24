import axios from "axios";

const API_BASE = "http://localhost:5000/api/dashboard";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const dashboardAPI = {
  // Analytics
  getAnalytics: () => api.get("/analytics"),

  // Listings
  getListings: () => api.get("/listings"),
  createListing: (data) => api.post("/listings", data),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/listings/${id}`),

  // Bookings
  getBookings: () => api.get("/bookings"),
  getCalendarBookings: (year, month) =>
    api.get(`/bookings/calendar?year=${year}&month=${month}`),
  createBooking: (data) => api.post("/bookings", data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),

  // Uploads
  uploadImage: (formData) =>
    api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Team
  getTeam: () => api.get("/team"),
  sendTeamAgentOtp: () => api.post("/team/agent/send-otp"),
  addAgentToTeam: (data) => api.post("/team/agent", data),
  updateAgent: (id, data) => api.put(`/team/agent/${id}`, data),
  deleteAgent: (id) => api.delete(`/team/agent/${id}`),
  addGuideToTeam: (data) => api.post("/team/guide", data),
  updateGuide: (id, data) => api.put(`/team/guide/${id}`, data),
  deleteGuide: (id) => api.delete(`/team/guide/${id}`),
  getCustomers: () => api.get("/customers"),
  getActivityHistory: () => api.get("/history"),
  getReviews: () => api.get("/reviews"),
  getNotifications: () => api.get("/notifications"),
  markNotificationsRead: () => api.put("/notifications/mark-read"),
  getMessages: () => api.get("/messages"),
  getConversation: (email) => api.get(`/messages/conversation/${email}`),
  markMessageRead: (id) => api.put(`/messages/${id}/read`),
  replyMessage: (id, message) => api.post(`/messages/${id}/reply`, { message }),
  updateProfile: (data) => api.put("/profile", data),
};
