import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useApplicationStore = create((set, get) => ({
  applications: [],
  selectedEvent: null,
  isApplicationsLoading: false,

  // Fetch applications for a specific event
  getApplications: async (event) => {
    set({ isApplicationsLoading: true });
    try {
        console.log(event._id)
      const res = await axiosInstance.get(`/events/${event._id}/applications`);
      set({ applications: res.data });
      console.log(get().applications)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch applications");
    } finally {
      set({ isApplicationsLoading: false });
    }
  },

  // Select an event to view applications
  setSelectedEvent: (event) => {
    console.log(event);
    set({ selectedEvent: event, applications: [] });
    get().getApplications(event); // Fetch applications for the selected event
  },
}));
