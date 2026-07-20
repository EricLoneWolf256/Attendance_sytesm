import { useState, useEffect, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));
    s.on("reconnect", () => setIsConnected(true));

    s.connect();
    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    socketRef.current?.emit("join-session", sessionId);
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    socketRef.current?.emit("leave-session", sessionId);
  }, []);

  return { socket, isConnected, joinSession, leaveSession };
}
