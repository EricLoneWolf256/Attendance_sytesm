import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import { config } from "../config";

export class QRService {
  static async startSession(courseId: string, semesterId: string) {
    const existingActive = await prisma.qRSession.findFirst({
      where: { courseId, isActive: true },
    });
    if (existingActive) {
      throw new Error("Active session already exists for this course");
    }

    const qrData = JSON.stringify({
      sessionId: uuidv4(),
      courseId,
      timestamp: Date.now(),
      nonce: uuidv4(),
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const expiresAt = new Date(Date.now() + config.qrRotationSeconds * 1000);

    const session = await prisma.qRSession.create({
      data: {
        courseId,
        semesterId,
        qrCode,
        expiresAt,
        isActive: true,
      },
      include: { course: true },
    });

    return {
      sessionId: session.id,
      qrCode: session.qrCode,
      expiresAt: session.expiresAt.toISOString(),
      courseId: session.courseId,
      courseName: session.course.name,
    };
  }

  static async rotateSession(sessionId: string) {
    const existing = await prisma.qRSession.findUnique({
      where: { id: sessionId },
    });
    if (!existing || !existing.isActive) {
      throw new Error("Session not found or inactive");
    }

    const qrData = JSON.stringify({
      sessionId: existing.id,
      courseId: existing.courseId,
      timestamp: Date.now(),
      nonce: uuidv4(),
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const expiresAt = new Date(Date.now() + config.qrRotationSeconds * 1000);

    await prisma.qRSession.update({
      where: { id: sessionId },
      data: { qrCode, expiresAt },
    });

    return { qrCode, expiresAt: expiresAt.toISOString() };
  }

  static async stopSession(sessionId: string) {
    const session = await prisma.qRSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
    return session;
  }

  static async getActiveSession(courseId: string) {
    return prisma.qRSession.findFirst({
      where: { courseId, isActive: true },
      include: { course: true },
    });
  }

  static async validateQRCode(qrCode: string) {
    const session = await prisma.qRSession.findFirst({
      where: { qrCode, isActive: true },
    });

    if (!session) {
      throw new Error("Invalid QR code");
    }
    if (session.expiresAt < new Date()) {
      throw new Error("QR code has expired");
    }

    return session;
  }
}
