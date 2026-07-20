import puppeteer from "puppeteer";
import { prisma } from "../lib/prisma";

interface SessionData {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  venue: string | null;
  topic: string | null;
  modeOfTeaching: string;
  status: string;
  courseOffering: {
    course: { code: string; title: string };
    programme: { name: string };
    semester: {
      name: string;
      intakeMonth: string | null;
      academicYear: { label: string };
    };
    lecturer: { name: string };
  };
  starter: { name: string } | null;
  attendanceRecords: {
    id: string;
    status: string;
    signedInAt: Date | null;
    student: {
      name: string;
      regNumber: string | null;
      gender: string | null;
    };
  }[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(session: SessionData): string {
  const co = session.courseOffering;
  const dateStr = formatDate(session.date);
  const startTimeStr = formatTime(session.startTime);
  const endTimeStr = session.endTime ? formatTime(session.endTime) : "--";
  const durationStr = session.duration != null ? String(session.duration) : "--";

  const rows = session.attendanceRecords
    .map((record, index) => {
      const signInTime = record.signedInAt ? formatTime(record.signedInAt) : "-";
      const statusLabel =
        record.status === "present"
          ? "Present"
          : record.status === "late"
          ? "Late"
          : record.status === "excused"
          ? "Excused"
          : "Absent";

      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${index + 1}</td>
          <td style="padding: 6px 8px; border: 1px solid #333; font-size: 11px;">${escapeHtml(record.student.name)}</td>
          <td style="padding: 6px 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${escapeHtml(record.student.regNumber || "N/A")}</td>
          <td style="padding: 6px 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${escapeHtml(record.student.gender || "N/A")}</td>
          <td style="padding: 6px 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${signInTime}</td>
          <td style="padding: 6px 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${statusLabel}</td>
        </tr>`;
    })
    .join("");

  const className = escapeHtml(co.programme.name);
  const academicYear = escapeHtml(co.semester.academicYear.label);
  const semesterName = escapeHtml(co.semester.name);
  const intakeMonth = escapeHtml(co.semester.intakeMonth || "");
  const courseCode = escapeHtml(co.course.code);
  const courseTitle = escapeHtml(co.course.title);
  const lecturerName = escapeHtml(co.lecturer.name);
  const venue = escapeHtml(session.venue || "N/A");
  const topic = escapeHtml(session.topic || "N/A");
  const starterName = escapeHtml(session.starter?.name || "N/A");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12px;
      color: #000;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      margin-bottom: 4px;
    }
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .header p {
      font-size: 11pt;
      margin-bottom: 2px;
    }
    .meta-line {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 10px;
      color: #333;
    }
    .title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 12px 0;
    }
    .info-block {
      margin-bottom: 12px;
      font-size: 11pt;
    }
    .info-block p {
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background-color: #e5e7eb;
      font-weight: bold;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #333;
      padding: 5px 8px;
      text-align: left;
    }
    .footer {
      margin-top: 20px;
      font-size: 11pt;
    }
    .footer p {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Uganda Martyrs University</h1>
    <p>Faculty of ${className}</p>
  </div>

  <div class="meta-line">
    Academic Year: ${academicYear} | Semester: ${semesterName} | Intake: ${intakeMonth} | Campus: Faculty of ${className}
  </div>

  <div class="title">CLASS ATTENDANCE REGISTER</div>

  <div class="info-block">
    <p><strong>Course:</strong> ${courseCode} - ${courseTitle}</p>
    <p><strong>Lecturer:</strong> ${lecturerName} ________________________ (Sign)</p>
    <p><strong>Date:</strong> ${dateStr} | <strong>Mode:</strong> ${escapeHtml(session.modeOfTeaching)} | <strong>Start:</strong> ${startTimeStr} | <strong>End:</strong> ${endTimeStr} | <strong>Duration:</strong> ${durationStr} min</p>
    <p><strong>Venue:</strong> ${venue} | <strong>Topic:</strong> ${topic}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">No.</th>
        <th>Name</th>
        <th style="width: 120px; text-align: center;">Reg. Number</th>
        <th style="width: 60px; text-align: center;">Gender</th>
        <th style="width: 90px; text-align: center;">Sign In</th>
        <th style="width: 70px; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="6" style="text-align: center; padding: 12px; border: 1px solid #333;">No attendance records</td></tr>`}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Class Coordinator:</strong> ${starterName} ________________________ (Sign)</p>
    <p><strong>Tel:</strong> _______________</p>
  </div>
</body>
</html>`;
}

export async function generateSessionPdf(sessionId: string): Promise<Buffer> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      courseOffering: {
        include: {
          course: { select: { code: true, title: true } },
          programme: { select: { name: true } },
          semester: {
            include: {
              academicYear: { select: { label: true } },
            },
          },
          lecturer: { select: { name: true } },
        },
      },
      starter: { select: { name: true } },
      attendanceRecords: {
        include: {
          student: {
            select: { name: true, regNumber: true, gender: true },
          },
        },
        orderBy: { signedInAt: "asc" },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const html = buildHtml(session as unknown as SessionData);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
