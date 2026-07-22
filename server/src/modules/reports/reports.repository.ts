import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  StudentAttendanceQuery,
  CourseAttendanceQuery,
  SessionAttendanceQuery,
  FacultyOverviewQuery,
  DepartmentOverviewQuery,
  AttendanceTrendQuery,
} from "./reports.validation";
import {
  StudentAttendanceSummary,
  CourseAttendanceSummary,
  SessionAttendanceDetail,
  FacultyAttendanceOverview,
  DepartmentAttendanceOverview,
  DailyAttendanceTrend,
} from "./reports.types";

export class ReportsRepository {
  async getStudentAttendanceSummary(query: StudentAttendanceQuery): Promise<StudentAttendanceSummary[]> {
    const sessionWhere: Prisma.ClassSessionWhereInput = {};

    if (query.courseOfferingId) {
      sessionWhere.courseOfferingId = query.courseOfferingId;
    }
    if (query.semesterId) {
      sessionWhere.semesterId = query.semesterId;
    }

    const student = await prisma.user.findUnique({
      where: { id: query.studentId },
      select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true },
    });

    if (!student) return [];

    const sessions = await prisma.classSession.findMany({
      where: {
        status: { in: ["OPEN", "CLOSED"] },
        ...sessionWhere,
      },
      select: { id: true },
    });

    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length === 0) {
      return [{
        student,
        totalSessions: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        attendancePercentage: 0,
      }];
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: query.studentId,
        sessionId: { in: sessionIds },
      },
      select: { status: true },
    });

    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;
    const totalSessions = sessionIds.length;
    const attendancePercentage = totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 0;

    return [{
      student,
      totalSessions,
      present,
      late,
      absent,
      excused,
      attendancePercentage,
    }];
  }

  async getCourseAttendanceSummary(query: CourseAttendanceQuery): Promise<CourseAttendanceSummary> {
    const offering = await prisma.courseOffering.findUnique({
      where: { id: query.courseOfferingId },
      select: {
        id: true,
        course: { select: { code: true, title: true } },
        programme: { select: { name: true, code: true } },
        yearOfStudy: true,
      },
    });

    if (!offering) {
      throw new Error("Course offering not found");
    }

    const sessions = await prisma.classSession.findMany({
      where: { courseOfferingId: query.courseOfferingId, status: { in: ["OPEN", "CLOSED"] } },
      select: { id: true, date: true, topic: true },
      orderBy: { date: "asc" },
    });

    const enrollmentCount = await prisma.enrollment.count({
      where: { courseOfferingId: query.courseOfferingId, status: "ENROLLED" },
    });

    const attendanceBySession = await Promise.all(
      sessions.map(async (session) => {
        const records = await prisma.attendanceRecord.findMany({
          where: { sessionId: session.id },
          select: { status: true },
        });

        return {
          sessionId: session.id,
          date: session.date,
          topic: session.topic,
          present: records.filter((r) => r.status === "PRESENT").length,
          late: records.filter((r) => r.status === "LATE").length,
          absent: records.filter((r) => r.status === "ABSENT").length,
          excused: records.filter((r) => r.status === "EXCUSED").length,
          total: records.length,
        };
      })
    );

    const totalPresent = attendanceBySession.reduce((sum, s) => sum + s.present, 0);
    const totalLate = attendanceBySession.reduce((sum, s) => sum + s.late, 0);
    const totalPossible = sessions.length * enrollmentCount;
    const averageAttendance = totalPossible > 0 ? Math.round(((totalPresent + totalLate) / totalPossible) * 100) : 0;

    return {
      courseOffering: offering,
      totalSessions: sessions.length,
      totalEnrolled: enrollmentCount,
      averageAttendance,
      attendanceBySession,
    };
  }

  async getSessionAttendanceDetail(query: SessionAttendanceQuery): Promise<SessionAttendanceDetail> {
    const session = await prisma.classSession.findUnique({
      where: { id: query.sessionId },
      select: { id: true, date: true, topic: true, status: true, modeOfTeaching: true, courseOfferingId: true },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseOfferingId: session.courseOfferingId, status: "ENROLLED" },
      select: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
      },
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { sessionId: query.sessionId },
      select: {
        studentId: true,
        status: true,
        signedInAt: true,
        signInMethod: true,
        student: { select: { firstName: true, lastName: true, email: true, studentNumber: true } },
      },
    });

    const records = enrolledStudents.map((enrollment) => {
      const record = attendanceRecords.find((r) => r.studentId === enrollment.student.id);
      return {
        studentId: enrollment.student.id,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        email: enrollment.student.email,
        studentNumber: enrollment.student.studentNumber,
        status: record?.status ?? "ABSENT",
        signedInAt: record?.signedInAt ?? null,
        signInMethod: record?.signInMethod ?? null,
      };
    });

    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;
    const totalEnrolled = enrolledStudents.length;
    const attendancePercentage = totalEnrolled > 0 ? Math.round(((present + late) / totalEnrolled) * 100) : 0;

    return {
      session: { id: session.id, date: session.date, topic: session.topic, status: session.status, modeOfTeaching: session.modeOfTeaching },
      totalEnrolled,
      present,
      late,
      absent,
      excused,
      attendancePercentage,
      records,
    };
  }

  async getFacultyOverview(query: FacultyOverviewQuery): Promise<FacultyAttendanceOverview> {
    const faculty = await prisma.faculty.findUnique({
      where: { id: query.facultyId },
      select: { id: true, name: true, code: true },
    });

    if (!faculty) {
      throw new Error("Faculty not found");
    }

    const [totalDepartments, totalProgrammes, totalCourses] = await Promise.all([
      prisma.department.count({ where: { facultyId: query.facultyId } }),
      prisma.programme.count({ where: { department: { facultyId: query.facultyId } } }),
      prisma.course.count({ where: { department: { facultyId: query.facultyId } } }),
    ]);

    const sessionsWhere: Prisma.ClassSessionWhereInput = {
      courseOffering: { course: { department: { facultyId: query.facultyId } } },
      status: { in: ["OPEN", "CLOSED"] },
    };

    if (query.academicYearId) {
      sessionsWhere.courseOffering = { ...sessionsWhere.courseOffering as Prisma.CourseOfferingWhereInput, academicYearId: query.academicYearId };
    }

    const totalSessions = await prisma.classSession.count({ where: sessionsWhere });

    const allRecords = await prisma.attendanceRecord.findMany({
      where: { session: sessionsWhere },
      select: { status: true },
    });

    const present = allRecords.filter((r) => r.status === "PRESENT").length;
    const late = allRecords.filter((r) => r.status === "LATE").length;
    const averageAttendance = allRecords.length > 0 ? Math.round(((present + late) / allRecords.length) * 100) : 0;

    return {
      faculty,
      totalDepartments,
      totalProgrammes,
      totalCourses,
      totalSessions,
      averageAttendance,
    };
  }

  async getDepartmentOverview(query: DepartmentOverviewQuery): Promise<DepartmentAttendanceOverview> {
    const department = await prisma.department.findUnique({
      where: { id: query.departmentId },
      select: { id: true, name: true, code: true },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    const [totalProgrammes, totalCourses] = await Promise.all([
      prisma.programme.count({ where: { departmentId: query.departmentId } }),
      prisma.course.count({ where: { departmentId: query.departmentId } }),
    ]);

    const sessionsWhere: Prisma.ClassSessionWhereInput = {
      courseOffering: { course: { departmentId: query.departmentId } },
      status: { in: ["OPEN", "CLOSED"] },
    };

    if (query.academicYearId) {
      sessionsWhere.courseOffering = { ...sessionsWhere.courseOffering as Prisma.CourseOfferingWhereInput, academicYearId: query.academicYearId };
    }

    const totalSessions = await prisma.classSession.count({ where: sessionsWhere });

    const allRecords = await prisma.attendanceRecord.findMany({
      where: { session: sessionsWhere },
      select: { status: true },
    });

    const present = allRecords.filter((r) => r.status === "PRESENT").length;
    const late = allRecords.filter((r) => r.status === "LATE").length;
    const averageAttendance = allRecords.length > 0 ? Math.round(((present + late) / allRecords.length) * 100) : 0;

    return {
      department,
      totalProgrammes,
      totalCourses,
      totalSessions,
      averageAttendance,
    };
  }

  async getAttendanceTrend(query: AttendanceTrendQuery): Promise<DailyAttendanceTrend[]> {
    const sessionWhere: Prisma.ClassSessionWhereInput = {
      status: { in: ["OPEN", "CLOSED"] },
    };

    if (query.courseOfferingId) sessionWhere.courseOfferingId = query.courseOfferingId;
    if (query.programmeId) sessionWhere.courseOffering = { ...sessionWhere.courseOffering as Prisma.CourseOfferingWhereInput, programmeId: query.programmeId };
    if (query.departmentId) sessionWhere.courseOffering = { ...sessionWhere.courseOffering as Prisma.CourseOfferingWhereInput, course: { departmentId: query.departmentId } };
    if (query.dateFrom || query.dateTo) {
      sessionWhere.date = {};
      if (query.dateFrom) sessionWhere.date.gte = query.dateFrom;
      if (query.dateTo) sessionWhere.date.lte = query.dateTo;
    }

    const sessions = await prisma.classSession.findMany({
      where: sessionWhere,
      select: { id: true, date: true },
      orderBy: { date: "asc" },
    });

    const groupedByDate = new Map<string, string[]>();

    for (const session of sessions) {
      const dateKey = session.date.toISOString().split("T")[0];
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(session.id);
    }

    const trend: DailyAttendanceTrend[] = [];

    for (const [date, sessionIds] of groupedByDate) {
      const records = await prisma.attendanceRecord.findMany({
        where: { sessionId: { in: sessionIds } },
        select: { status: true },
      });

      const present = records.filter((r) => r.status === "PRESENT").length;
      const late = records.filter((r) => r.status === "LATE").length;
      const absent = records.filter((r) => r.status === "ABSENT").length;
      const excused = records.filter((r) => r.status === "EXCUSED").length;
      const attendancePercentage = records.length > 0 ? Math.round(((present + late) / records.length) * 100) : 0;

      trend.push({
        date,
        totalSessions: sessionIds.length,
        present,
        late,
        absent,
        excused,
        attendancePercentage,
      });
    }

    return trend;
  }
}
