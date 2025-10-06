import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://lectern-usqo.onrender.com"; // your Render backend URL

// Initialize Socket connection
export const socket = io(SOCKET_URL, {
  withCredentials: true, // sends cookies automatically
  transports: ["websocket"], // faster & reliable
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});
