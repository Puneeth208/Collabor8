import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { connect } from "mongoose";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  curUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ curUser: res.data });
      get().connectSocket();
      console.log(get().curUser);
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ curUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },



  connectSocket: () => {
    const { curUser } = get();
    if (!curUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: curUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    console.log("user disconnected")
  },
}));