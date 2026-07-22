import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { config } from "../config";
import { AuthPayload } from "../middleware/auth";
import { authenticateSocket } from "./auth";
import { rooms, ADMIN_ROLES } from "./rooms";
import { SOCKET_EVENTS } from "./events";
import { registerSessionHandlers, registerAttendanceHandlers } from "./handlers";
import { socketLogger } from "./logger";

export interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthPayload;
  };
}

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ["websocket", "polling"],
  });

  registerConnectionHandler(io);
  registerSessionHandlers(io);
  registerAttendanceHandlers(io);

  socketLogger.info("Socket.IO server initialized");
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized. Call initializeSocket() first.");
  return io;
}

function registerConnectionHandler(io: Server): void {
  io.on("connection", (socket: Socket) => {
    const payload = authenticateSocket(socket);
    if (!payload) return;

    const s = socket as AuthenticatedSocket;
    s.data.user = payload;

    socketLogger.info(`connected: user=${payload.userId} role=${payload.role} socket=${socket.id}`);

    // Auto-join user-specific room (supports multi-tab)
    socket.join(rooms.user(payload.userId));

    // Auto-join admin room for admin roles
    if (ADMIN_ROLES.has(payload.role)) {
      socket.join(rooms.admin());
    }

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      userId: payload.userId,
      role: payload.role,
    });

    // ─── Room join/leave handlers ───

    socket.on(SOCKET_EVENTS.JOIN_SESSION, (sessionId: string) => {
      socket.join(rooms.session(sessionId));
      socketLogger.info(`join-session: user=${payload.userId} → session:${sessionId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_SESSION, (sessionId: string) => {
      socket.leave(rooms.session(sessionId));
      socketLogger.info(`leave-session: user=${payload.userId} ← session:${sessionId}`);
    });

    socket.on(SOCKET_EVENTS.JOIN_COURSE_OFFERING, (offeringId: string) => {
      socket.join(rooms.courseOffering(offeringId));
    });

    socket.on(SOCKET_EVENTS.LEAVE_COURSE_OFFERING, (offeringId: string) => {
      socket.leave(rooms.courseOffering(offeringId));
    });

    socket.on(SOCKET_EVENTS.JOIN_LECTURER, (lecturerId: string) => {
      socket.join(rooms.lecturer(lecturerId));
    });

    socket.on(SOCKET_EVENTS.LEAVE_LECTURER, (lecturerId: string) => {
      socket.leave(rooms.lecturer(lecturerId));
    });

    socket.on(SOCKET_EVENTS.JOIN_FACULTY, (facultyId: string) => {
      socket.join(rooms.faculty(facultyId));
    });

    socket.on(SOCKET_EVENTS.LEAVE_FACULTY, (facultyId: string) => {
      socket.leave(rooms.faculty(facultyId));
    });

    socket.on(SOCKET_EVENTS.JOIN_ADMIN, () => {
      if (ADMIN_ROLES.has(payload.role)) {
        socket.join(rooms.admin());
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ADMIN, () => {
      socket.leave(rooms.admin());
    });

    // ─── Disconnect cleanup ───

    socket.on("disconnect", (reason) => {
      socketLogger.info(`disconnected: user=${payload.userId} socket=${socket.id} reason=${reason}`);
    });

    socket.on("error", (err) => {
      socketLogger.error(`error: user=${payload.userId} socket=${socket.id}`, err);
    });
  });
}
