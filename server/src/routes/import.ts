import { Router, Request, Response } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import { parse } from "csv-parse/sync";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
const SALT_ROUNDS = 10;
const upload = multer({ storage: multer.memoryStorage() });

interface CsvRow {
  name: string;
  email: string;
  password?: string;
  regNumber: string;
  gender: string;
  campusId: string;
  facultyId: string;
  programmeId: string;
  yearOfStudy: string;
}

router.post(
  "/students",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const content = req.file.buffer.toString("utf-8");

    let records: CsvRow[];
    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      return res.status(400).json({ error: "Invalid CSV format" });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: "CSV file is empty" });
    }

    const errors: Array<{ row: number; error: string }> = [];
    let imported = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      try {
        if (!row.name || !row.email || !row.regNumber || !row.campusId) {
          errors.push({ row: rowNum, error: "Missing required fields (name, email, regNumber, campusId)" });
          continue;
        }

        const existing = await prisma.user.findUnique({ where: { email: row.email } });
        if (existing) {
          errors.push({ row: rowNum, error: `Email "${row.email}" already registered` });
          continue;
        }

        const password = row.password || "password123";
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await prisma.user.create({
          data: {
            name: row.name,
            email: row.email,
            passwordHash,
            role: "STUDENT",
            regNumber: row.regNumber,
            gender: row.gender || null,
            campusId: row.campusId,
            facultyId: row.facultyId || null,
            programmeId: row.programmeId || null,
            yearOfStudy: row.yearOfStudy ? parseInt(row.yearOfStudy, 10) : null,
            status: "active",
          },
        });

        imported++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors.push({ row: rowNum, error: message });
      }
    }

    res.json({ imported, errors });
  }
);

export default router;
