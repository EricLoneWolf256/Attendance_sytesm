import { describe, it, expect } from "vitest";
import {
  createFacultySchema,
  updateFacultySchema,
  listFacultiesQuerySchema,
} from "../../modules/faculties/faculties.validation";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsQuerySchema,
} from "../../modules/departments/departments.validation";
import {
  createProgrammeSchema,
  updateProgrammeSchema,
} from "../../modules/programmes/programmes.validation";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../../modules/courses/courses.validation";
import {
  createSemesterSchema,
  updateSemesterSchema,
  listSemestersQuerySchema,
} from "../../modules/semesters/semesters.validation";
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  listAcademicYearsQuerySchema,
} from "../../modules/academic-years/academic-years.validation";
import {
  createEnrollmentSchema,
  bulkCreateEnrollmentSchema,
  updateEnrollmentSchema,
} from "../../modules/enrollments/enrollments.validation";
import {
  createClassSessionSchema,
  updateClassSessionSchema,
  listClassSessionsQuerySchema,
} from "../../modules/class-sessions/class-sessions.validation";
import {
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
  updateAttendanceSchema,
  listAttendanceQuerySchema,
} from "../../modules/attendance/attendance.validation";
import {
  createCourseOfferingSchema,
  updateCourseOfferingSchema,
  listCourseOfferingsQuerySchema,
} from "../../modules/course-offerings/course-offerings.validation";
import { z } from "zod";

const validFaculty = { name: "Faculty of Science", code: "FOS", campusId: "campus-1" };
const validDepartment = { name: "Department of Computer Science", code: "DCS", facultyId: "faculty-1" };
const validProgramme = { name: "Bachelor of Computer Science", code: "BCS", departmentId: "dept-1" };
const validCourse = { code: "CS101", title: "Intro to Programming", departmentId: "dept-1" };
const validAcademicYear = { label: "2024/2025", startDate: "2024-09-01", endDate: "2025-06-30" };
const validSemester = { academicYearId: "ay-1", name: "Semester 1", startDate: "2024-09-01", endDate: "2025-01-15" };
const validEnrollment = { studentId: "student-1", courseOfferingId: "co-1" };
const validBulkEnrollment = { studentIds: ["student-1", "student-2"], courseOfferingId: "co-1" };
const validClassSession = { courseOfferingId: "co-1", date: "2024-10-15", startTime: "2024-10-15T08:00:00.000Z" };
const validAttendance = { sessionId: "session-1", studentId: "student-1" };
const validBulkAttendance = {
  sessionId: "session-1",
  records: [{ studentId: "student-1" }, { studentId: "student-2", status: "LATE" as const }],
};
const validCourseOffering = {
  courseId: "course-1",
  programmeId: "prog-1",
  yearOfStudy: 2,
  semesterId: "sem-1",
  lecturerId: "lecturer-1",
  academicYearId: "ay-1",
};

function expectSuccess(schema: z.ZodTypeAny, data: unknown) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
  return result;
}

function expectFailure(schema: z.ZodTypeAny, data: unknown) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  return result;
}

describe("Faculties Validation", () => {
  describe("createFacultySchema", () => {
    it("should accept valid data", () => expectSuccess(createFacultySchema, validFaculty));

    it("should accept optional deanId", () =>
      expectSuccess(createFacultySchema, { ...validFaculty, deanId: "user-1" }));

    it("should accept nullable deanId", () =>
      expectSuccess(createFacultySchema, { ...validFaculty, deanId: null }));

    it("should reject name shorter than 2 chars", () =>
      expectFailure(createFacultySchema, { ...validFaculty, name: "A" }));

    it("should reject code shorter than 2 chars", () =>
      expectFailure(createFacultySchema, { ...validFaculty, code: "X" }));

    it("should reject code longer than 10 chars", () =>
      expectFailure(createFacultySchema, { ...validFaculty, code: "A".repeat(11) }));

    it("should accept code at boundary of 10 chars", () =>
      expectSuccess(createFacultySchema, { ...validFaculty, code: "A".repeat(10) }));

    it("should reject missing name", () => expectFailure(createFacultySchema, { code: "FOS", campusId: "c-1" }));

    it("should reject missing code", () =>
      expectFailure(createFacultySchema, { name: "Faculty", campusId: "c-1" }));

    it("should reject missing campusId", () =>
      expectFailure(createFacultySchema, { name: "Faculty", code: "FOS" }));
  });

  describe("updateFacultySchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateFacultySchema, { name: "New Name" }));

    it("should accept multiple fields", () =>
      expectSuccess(updateFacultySchema, { name: "New", code: "NW" }));

    it("should accept isActive boolean", () =>
      expectSuccess(updateFacultySchema, { isActive: false }));

    it("should reject empty object", () => expectFailure(updateFacultySchema, {}));

    it("should reject name shorter than 2 chars", () =>
      expectFailure(updateFacultySchema, { name: "A" }));

    it("should reject code longer than 10 chars", () =>
      expectFailure(updateFacultySchema, { code: "A".repeat(11) }));
  });

  describe("listFacultiesQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listFacultiesQuerySchema, {}) as { data: { page: number; limit: number; sortBy: string; sortOrder: string } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    });

    it("should coerce page and limit to numbers", () => {
      const result = expectSuccess(listFacultiesQuerySchema, { page: "2", limit: "50" }) as { data: { page: number; limit: number } };
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    });

    it("should reject page < 1", () =>
      expectFailure(listFacultiesQuerySchema, { page: 0 }));

    it("should reject limit > 100", () =>
      expectFailure(listFacultiesQuerySchema, { limit: 101 }));

    it("should reject limit = 0", () =>
      expectFailure(listFacultiesQuerySchema, { limit: 0 }));

    it("should accept limit = 100", () =>
      expectSuccess(listFacultiesQuerySchema, { limit: 100 }));

    it("should reject invalid sortBy", () =>
      expectFailure(listFacultiesQuerySchema, { sortBy: "invalid" }));

    it("should accept all valid sortBy values", () => {
      for (const val of ["name", "code", "createdAt", "updatedAt"]) {
        expectSuccess(listFacultiesQuerySchema, { sortBy: val });
      }
    });

    it("should reject invalid sortOrder", () =>
      expectFailure(listFacultiesQuerySchema, { sortOrder: "up" }));

    it("should accept isActive as string", () => {
      const result = expectSuccess(listFacultiesQuerySchema, { isActive: "true" }) as { data: { isActive: boolean } };
      expect(result.data.isActive).toBe(true);
    });
  });
});

describe("Departments Validation", () => {
  describe("createDepartmentSchema", () => {
    it("should accept valid data", () => expectSuccess(createDepartmentSchema, validDepartment));

    it("should accept optional hodId", () =>
      expectSuccess(createDepartmentSchema, { ...validDepartment, hodId: "user-1" }));

    it("should reject name shorter than 2 chars", () =>
      expectFailure(createDepartmentSchema, { ...validDepartment, name: "X" }));

    it("should reject code longer than 10 chars", () =>
      expectFailure(createDepartmentSchema, { ...validDepartment, code: "A".repeat(11) }));

    it("should reject missing facultyId", () =>
      expectFailure(createDepartmentSchema, { name: "CS", code: "DCS" }));
  });

  describe("updateDepartmentSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateDepartmentSchema, { name: "New Name" }));

    it("should reject empty object", () => expectFailure(updateDepartmentSchema, {}));

    it("should accept isActive field", () =>
      expectSuccess(updateDepartmentSchema, { isActive: true }));
  });

  describe("listDepartmentsQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listDepartmentsQuerySchema, {}) as { data: { page: number; limit: number } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it("should accept facultyId filter", () =>
      expectSuccess(listDepartmentsQuerySchema, { facultyId: "f-1" }));
  });
});

describe("Programmes Validation", () => {
  describe("createProgrammeSchema", () => {
    it("should accept valid data", () => expectSuccess(createProgrammeSchema, validProgramme));

    it("should apply default level UNDERGRADUATE", () => {
      const result = expectSuccess(createProgrammeSchema, validProgramme) as { data: { level: string } };
      expect(result.data.level).toBe("UNDERGRADUATE");
    });

    it("should apply default durationYears 4", () => {
      const result = expectSuccess(createProgrammeSchema, validProgramme) as { data: { durationYears: number } };
      expect(result.data.durationYears).toBe(4);
    });

    it("should accept all valid level values", () => {
      for (const level of ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"]) {
        expectSuccess(createProgrammeSchema, { ...validProgramme, level });
      }
    });

    it("should reject invalid level", () =>
      expectFailure(createProgrammeSchema, { ...validProgramme, level: "PHD" }));

    it("should reject durationYears < 1", () =>
      expectFailure(createProgrammeSchema, { ...validProgramme, durationYears: 0 }));

    it("should reject durationYears > 10", () =>
      expectFailure(createProgrammeSchema, { ...validProgramme, durationYears: 11 }));

    it("should accept durationYears at boundary 10", () =>
      expectSuccess(createProgrammeSchema, { ...validProgramme, durationYears: 10 }));

    it("should reject missing departmentId", () =>
      expectFailure(createProgrammeSchema, { name: "BCS", code: "BCS" }));
  });

  describe("updateProgrammeSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateProgrammeSchema, { name: "New" }));

    it("should reject empty object", () => expectFailure(updateProgrammeSchema, {}));

    it("should accept durationYears boundary values", () => {
      expectSuccess(updateProgrammeSchema, { durationYears: 1 });
      expectSuccess(updateProgrammeSchema, { durationYears: 10 });
    });
  });
});

describe("Courses Validation", () => {
  describe("createCourseSchema", () => {
    it("should accept valid data", () => expectSuccess(createCourseSchema, validCourse));

    it("should apply default creditUnits 3", () => {
      const result = expectSuccess(createCourseSchema, validCourse) as { data: { creditUnits: number } };
      expect(result.data.creditUnits).toBe(3);
    });

    it("should apply default level 1", () => {
      const result = expectSuccess(createCourseSchema, validCourse) as { data: { level: number } };
      expect(result.data.level).toBe(1);
    });

    it("should accept code at boundary of 2 chars", () =>
      expectSuccess(createCourseSchema, { ...validCourse, code: "AB" }));

    it("should accept code at boundary of 20 chars", () =>
      expectSuccess(createCourseSchema, { ...validCourse, code: "A".repeat(20) }));

    it("should reject code shorter than 2 chars", () =>
      expectFailure(createCourseSchema, { ...validCourse, code: "A" }));

    it("should reject code longer than 20 chars", () =>
      expectFailure(createCourseSchema, { ...validCourse, code: "A".repeat(21) }));

    it("should reject creditUnits < 0", () =>
      expectFailure(createCourseSchema, { ...validCourse, creditUnits: -1 }));

    it("should reject creditUnits > 20", () =>
      expectFailure(createCourseSchema, { ...validCourse, creditUnits: 21 }));

    it("should accept creditUnits at boundaries", () => {
      expectSuccess(createCourseSchema, { ...validCourse, creditUnits: 0 });
      expectSuccess(createCourseSchema, { ...validCourse, creditUnits: 20 });
    });

    it("should reject level < 1", () =>
      expectFailure(createCourseSchema, { ...validCourse, level: 0 }));

    it("should reject level > 10", () =>
      expectFailure(createCourseSchema, { ...validCourse, level: 11 }));

    it("should accept description as optional", () =>
      expectSuccess(createCourseSchema, { ...validCourse, description: "A course" }));

    it("should accept nullable description", () =>
      expectSuccess(createCourseSchema, { ...validCourse, description: null }));

    it("should accept prerequisites as optional", () =>
      expectSuccess(createCourseSchema, { ...validCourse, prerequisites: "CS100" }));

    it("should reject missing title", () =>
      expectFailure(createCourseSchema, { code: "CS101", departmentId: "d-1" }));
  });

  describe("updateCourseSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateCourseSchema, { title: "New Title" }));

    it("should reject empty object", () => expectFailure(updateCourseSchema, {}));

    it("should accept all valid fields", () =>
      expectSuccess(updateCourseSchema, {
        code: "CS102",
        title: "Advanced",
        creditUnits: 4,
        level: 3,
        isActive: true,
      }));
  });
});

describe("Academic Years Validation", () => {
  describe("createAcademicYearSchema", () => {
    it("should accept valid data", () => expectSuccess(createAcademicYearSchema, validAcademicYear));

    it("should accept isCurrent boolean", () =>
      expectSuccess(createAcademicYearSchema, { ...validAcademicYear, isCurrent: true }));

    it("should reject endDate before startDate", () =>
      expectFailure(createAcademicYearSchema, {
        label: "2024/2025",
        startDate: "2025-06-01",
        endDate: "2024-09-01",
      }));

    it("should reject endDate equal to startDate", () =>
      expectFailure(createAcademicYearSchema, {
        label: "2024/2025",
        startDate: "2024-09-01",
        endDate: "2024-09-01",
      }));

    it("should reject missing label", () =>
      expectFailure(createAcademicYearSchema, { startDate: "2024-09-01", endDate: "2025-06-30" }));

    it("should reject missing startDate", () =>
      expectFailure(createAcademicYearSchema, { label: "2024/2025", endDate: "2025-06-30" }));

    it("should reject missing endDate", () =>
      expectFailure(createAcademicYearSchema, { label: "2024/2025", startDate: "2024-09-01" }));

    it("should reject label shorter than 2 chars", () =>
      expectFailure(createAcademicYearSchema, { ...validAcademicYear, label: "X" }));
  });

  describe("updateAcademicYearSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateAcademicYearSchema, { label: "2025/2026" }));

    it("should reject empty object", () => expectFailure(updateAcademicYearSchema, {}));

    it("should accept isCurrent only", () =>
      expectSuccess(updateAcademicYearSchema, { isCurrent: false }));
  });

  describe("listAcademicYearsQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listAcademicYearsQuerySchema, {}) as { data: { page: number; limit: number } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it("should reject invalid sortBy", () =>
      expectFailure(listAcademicYearsQuerySchema, { sortBy: "invalid" }));
  });
});

describe("Semesters Validation", () => {
  describe("createSemesterSchema", () => {
    it("should accept valid data", () => expectSuccess(createSemesterSchema, validSemester));

    it("should accept optional fields", () =>
      expectSuccess(createSemesterSchema, {
        ...validSemester,
        intakeMonth: "September",
        isActive: true,
      }));

    it("should accept nullable intakeMonth", () =>
      expectSuccess(createSemesterSchema, { ...validSemester, intakeMonth: null }));

    it("should reject endDate before startDate", () =>
      expectFailure(createSemesterSchema, {
        academicYearId: "ay-1",
        name: "Sem 1",
        startDate: "2025-06-01",
        endDate: "2024-09-01",
      }));

    it("should reject endDate equal to startDate", () =>
      expectFailure(createSemesterSchema, {
        academicYearId: "ay-1",
        name: "Sem 1",
        startDate: "2024-09-01",
        endDate: "2024-09-01",
      }));

    it("should reject missing academicYearId", () =>
      expectFailure(createSemesterSchema, {
        name: "Sem 1",
        startDate: "2024-09-01",
        endDate: "2025-01-15",
      }));

    it("should reject missing name", () =>
      expectFailure(createSemesterSchema, {
        academicYearId: "ay-1",
        startDate: "2024-09-01",
        endDate: "2025-01-15",
      }));

    it("should reject missing startDate", () =>
      expectFailure(createSemesterSchema, {
        academicYearId: "ay-1",
        name: "Sem 1",
        endDate: "2025-01-15",
      }));

    it("should reject missing endDate", () =>
      expectFailure(createSemesterSchema, {
        academicYearId: "ay-1",
        name: "Sem 1",
        startDate: "2024-09-01",
      }));

    it("should reject empty name", () =>
      expectFailure(createSemesterSchema, {
        ...validSemester,
        name: "",
      }));
  });

  describe("updateSemesterSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateSemesterSchema, { name: "New" }));

    it("should reject empty object", () => expectFailure(updateSemesterSchema, {}));

    it("should accept isActive only", () =>
      expectSuccess(updateSemesterSchema, { isActive: true }));
  });

  describe("listSemestersQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listSemestersQuerySchema, {}) as { data: { page: number; limit: number } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });
  });
});

describe("Enrollments Validation", () => {
  describe("createEnrollmentSchema", () => {
    it("should accept valid data", () => expectSuccess(createEnrollmentSchema, validEnrollment));

    it("should accept optional classGroupId", () =>
      expectSuccess(createEnrollmentSchema, { ...validEnrollment, classGroupId: "group-1" }));

    it("should accept nullable classGroupId", () =>
      expectSuccess(createEnrollmentSchema, { ...validEnrollment, classGroupId: null }));

    it("should reject missing studentId", () =>
      expectFailure(createEnrollmentSchema, { courseOfferingId: "co-1" }));

    it("should reject missing courseOfferingId", () =>
      expectFailure(createEnrollmentSchema, { studentId: "s-1" }));

    it("should reject empty studentId", () =>
      expectFailure(createEnrollmentSchema, { studentId: "", courseOfferingId: "co-1" }));
  });

  describe("bulkCreateEnrollmentSchema", () => {
    it("should accept valid data", () => expectSuccess(bulkCreateEnrollmentSchema, validBulkEnrollment));

    it("should reject empty studentIds array", () =>
      expectFailure(bulkCreateEnrollmentSchema, { studentIds: [], courseOfferingId: "co-1" }));

    it("should reject missing studentIds", () =>
      expectFailure(bulkCreateEnrollmentSchema, { courseOfferingId: "co-1" }));

    it("should reject studentIds with empty string", () =>
      expectFailure(bulkCreateEnrollmentSchema, { studentIds: [""], courseOfferingId: "co-1" }));

    it("should reject missing courseOfferingId", () =>
      expectFailure(bulkCreateEnrollmentSchema, { studentIds: ["s-1"] }));
  });

  describe("updateEnrollmentSchema", () => {
    it("should accept valid status update", () =>
      expectSuccess(updateEnrollmentSchema, { status: "ENROLLED" }));

    it("should accept all valid status values", () => {
      for (const status of ["ENROLLED", "DROPPED", "COMPLETED", "WITHDRAWN"]) {
        expectSuccess(updateEnrollmentSchema, { status });
      }
    });

    it("should reject invalid status", () =>
      expectFailure(updateEnrollmentSchema, { status: "INVALID" }));

    it("should reject empty object", () => expectFailure(updateEnrollmentSchema, {}));

    it("should accept classGroupId update", () =>
      expectSuccess(updateEnrollmentSchema, { classGroupId: "g-1" }));
  });
});

describe("Class Sessions Validation", () => {
  describe("createClassSessionSchema", () => {
    it("should accept valid data", () => expectSuccess(createClassSessionSchema, validClassSession));

    it("should apply default modeOfTeaching PHYSICAL", () => {
      const result = expectSuccess(createClassSessionSchema, validClassSession) as { data: { modeOfTeaching: string } };
      expect(result.data.modeOfTeaching).toBe("PHYSICAL");
    });

    it("should accept all modeOfTeaching values", () => {
      for (const mode of ["ONLINE", "PHYSICAL", "HYBRID"]) {
        expectSuccess(createClassSessionSchema, { ...validClassSession, modeOfTeaching: mode });
      }
    });

    it("should reject invalid modeOfTeaching", () =>
      expectFailure(createClassSessionSchema, { ...validClassSession, modeOfTeaching: "ASYNC" }));

    it("should accept optional fields", () =>
      expectSuccess(createClassSessionSchema, {
        ...validClassSession,
        semesterId: "sem-1",
        venueId: "venue-1",
        endTime: "2024-10-15T10:00:00.000Z",
        topic: "Intro to OOP",
        materials: "Slides 1-10",
        maxCheckInTime: "2024-10-15T08:30:00.000Z",
      }));

    it("should accept nullable optional fields", () =>
      expectSuccess(createClassSessionSchema, {
        ...validClassSession,
        semesterId: null,
        venueId: null,
        endTime: null,
        topic: null,
        materials: null,
        maxCheckInTime: null,
      }));

    it("should reject missing courseOfferingId", () =>
      expectFailure(createClassSessionSchema, { date: "2024-10-15", startTime: "2024-10-15T08:00:00.000Z" }));

    it("should reject missing date", () =>
      expectFailure(createClassSessionSchema, { courseOfferingId: "co-1", startTime: "2024-10-15T08:00:00.000Z" }));

    it("should reject missing startTime", () =>
      expectFailure(createClassSessionSchema, { courseOfferingId: "co-1", date: "2024-10-15" }));
  });

  describe("updateClassSessionSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateClassSessionSchema, { topic: "New Topic" }));

    it("should reject empty object", () => expectFailure(updateClassSessionSchema, {}));

    it("should accept all valid status values", () => {
      for (const status of ["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"]) {
        expectSuccess(updateClassSessionSchema, { status });
      }
    });

    it("should reject invalid status", () =>
      expectFailure(updateClassSessionSchema, { status: "PENDING" }));
  });

  describe("listClassSessionsQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listClassSessionsQuerySchema, {}) as { data: { page: number; limit: number; sortBy: string } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("date");
    });

    it("should accept dateFrom and dateTo filters", () =>
      expectSuccess(listClassSessionsQuerySchema, {
        dateFrom: "2024-09-01",
        dateTo: "2024-12-31",
      }));

    it("should accept all valid sortBy values", () => {
      for (const val of ["date", "startTime", "status", "createdAt"]) {
        expectSuccess(listClassSessionsQuerySchema, { sortBy: val });
      }
    });
  });
});

describe("Attendance Validation", () => {
  describe("markAttendanceSchema", () => {
    it("should accept valid data with defaults", () => {
      const result = expectSuccess(markAttendanceSchema, validAttendance) as { data: { status: string; signInMethod: string } };
      expect(result.data.status).toBe("PRESENT");
      expect(result.data.signInMethod).toBe("SELF");
    });

    it("should accept all status values", () => {
      for (const status of ["PRESENT", "ABSENT", "LATE", "EXCUSED"]) {
        expectSuccess(markAttendanceSchema, { ...validAttendance, status });
      }
    });

    it("should accept all signInMethod values", () => {
      for (const method of ["QR", "PIN", "SELF", "ADMIN_OVERRIDE"]) {
        expectSuccess(markAttendanceSchema, { ...validAttendance, signInMethod: method });
      }
    });

    it("should reject invalid status", () =>
      expectFailure(markAttendanceSchema, { ...validAttendance, status: "MAYBE" }));

    it("should reject invalid signInMethod", () =>
      expectFailure(markAttendanceSchema, { ...validAttendance, signInMethod: "BLUETOOTH" }));

    it("should accept optional deviceFingerprint", () =>
      expectSuccess(markAttendanceSchema, { ...validAttendance, deviceFingerprint: "abc123" }));

    it("should accept nullable deviceFingerprint", () =>
      expectSuccess(markAttendanceSchema, { ...validAttendance, deviceFingerprint: null }));

    it("should reject missing sessionId", () =>
      expectFailure(markAttendanceSchema, { studentId: "s-1" }));

    it("should reject missing studentId", () =>
      expectFailure(markAttendanceSchema, { sessionId: "session-1" }));

    it("should reject empty sessionId", () =>
      expectFailure(markAttendanceSchema, { sessionId: "", studentId: "s-1" }));
  });

  describe("bulkMarkAttendanceSchema", () => {
    it("should accept valid data", () => expectSuccess(bulkMarkAttendanceSchema, validBulkAttendance));

    it("should apply default signInMethod ADMIN_OVERRIDE", () => {
      const result = expectSuccess(bulkMarkAttendanceSchema, validBulkAttendance) as { data: { signInMethod: string } };
      expect(result.data.signInMethod).toBe("ADMIN_OVERRIDE");
    });

    it("should apply default status PRESENT for records without status", () => {
      const result = expectSuccess(bulkMarkAttendanceSchema, validBulkAttendance) as { data: { records: { status: string }[] } };
      expect(result.data.records[0].status).toBe("PRESENT");
      expect(result.data.records[1].status).toBe("LATE");
    });

    it("should reject empty records array", () =>
      expectFailure(bulkMarkAttendanceSchema, {
        sessionId: "s-1",
        records: [],
      }));

    it("should reject records with empty studentId", () =>
      expectFailure(bulkMarkAttendanceSchema, {
        sessionId: "s-1",
        records: [{ studentId: "" }],
      }));

    it("should reject missing sessionId", () =>
      expectFailure(bulkMarkAttendanceSchema, {
        records: [{ studentId: "s-1" }],
      }));

    it("should accept single record", () =>
      expectSuccess(bulkMarkAttendanceSchema, {
        sessionId: "s-1",
        records: [{ studentId: "s-1" }],
      }));
  });

  describe("updateAttendanceSchema", () => {
    it("should accept valid status update", () =>
      expectSuccess(updateAttendanceSchema, { status: "LATE" }));

    it("should accept valid signInMethod update", () =>
      expectSuccess(updateAttendanceSchema, { signInMethod: "QR" }));

    it("should accept both fields", () =>
      expectSuccess(updateAttendanceSchema, { status: "EXCUSED", signInMethod: "ADMIN_OVERRIDE" }));

    it("should reject empty object", () => expectFailure(updateAttendanceSchema, {}));

    it("should reject invalid status", () =>
      expectFailure(updateAttendanceSchema, { status: "INVALID" }));

    it("should reject invalid signInMethod", () =>
      expectFailure(updateAttendanceSchema, { signInMethod: "NFC" }));
  });

  describe("listAttendanceQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listAttendanceQuerySchema, {}) as { data: { page: number; limit: number; sortBy: string } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("signedInAt");
    });

    it("should accept all valid sortBy values", () => {
      for (const val of ["signedInAt", "status", "createdAt"]) {
        expectSuccess(listAttendanceQuerySchema, { sortBy: val });
      }
    });
  });
});

describe("Course Offerings Validation", () => {
  describe("createCourseOfferingSchema", () => {
    it("should accept valid data", () => expectSuccess(createCourseOfferingSchema, validCourseOffering));

    it("should accept optional classRepId", () =>
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, classRepId: "student-1" }));

    it("should accept nullable classRepId", () =>
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, classRepId: null }));

    it("should accept optional maxEnrollment", () =>
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, maxEnrollment: 50 }));

    it("should accept nullable maxEnrollment", () =>
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, maxEnrollment: null }));

    it("should reject yearOfStudy < 1", () =>
      expectFailure(createCourseOfferingSchema, { ...validCourseOffering, yearOfStudy: 0 }));

    it("should reject yearOfStudy > 10", () =>
      expectFailure(createCourseOfferingSchema, { ...validCourseOffering, yearOfStudy: 11 }));

    it("should accept yearOfStudy at boundaries", () => {
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, yearOfStudy: 1 });
      expectSuccess(createCourseOfferingSchema, { ...validCourseOffering, yearOfStudy: 10 });
    });

    it("should reject maxEnrollment < 1", () =>
      expectFailure(createCourseOfferingSchema, { ...validCourseOffering, maxEnrollment: 0 }));

    it("should reject missing courseId", () =>
      expectFailure(createCourseOfferingSchema, {
        programmeId: "p-1",
        yearOfStudy: 2,
        semesterId: "s-1",
        lecturerId: "l-1",
        academicYearId: "ay-1",
      }));

    it("should reject missing programmeId", () =>
      expectFailure(createCourseOfferingSchema, {
        courseId: "c-1",
        yearOfStudy: 2,
        semesterId: "s-1",
        lecturerId: "l-1",
        academicYearId: "ay-1",
      }));

    it("should reject missing semesterId", () =>
      expectFailure(createCourseOfferingSchema, {
        courseId: "c-1",
        programmeId: "p-1",
        yearOfStudy: 2,
        lecturerId: "l-1",
        academicYearId: "ay-1",
      }));

    it("should reject missing lecturerId", () =>
      expectFailure(createCourseOfferingSchema, {
        courseId: "c-1",
        programmeId: "p-1",
        yearOfStudy: 2,
        semesterId: "s-1",
        academicYearId: "ay-1",
      }));

    it("should reject missing academicYearId", () =>
      expectFailure(createCourseOfferingSchema, {
        courseId: "c-1",
        programmeId: "p-1",
        yearOfStudy: 2,
        semesterId: "s-1",
        lecturerId: "l-1",
      }));
  });

  describe("updateCourseOfferingSchema", () => {
    it("should accept valid partial update", () =>
      expectSuccess(updateCourseOfferingSchema, { lecturerId: "l-2" }));

    it("should reject empty object", () => expectFailure(updateCourseOfferingSchema, {}));

    it("should accept all valid status values", () => {
      for (const status of ["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"]) {
        expectSuccess(updateCourseOfferingSchema, { status });
      }
    });

    it("should reject invalid status", () =>
      expectFailure(updateCourseOfferingSchema, { status: "INVALID" }));

    it("should accept isActive boolean", () =>
      expectSuccess(updateCourseOfferingSchema, { isActive: false }));
  });

  describe("listCourseOfferingsQuerySchema", () => {
    it("should apply defaults", () => {
      const result = expectSuccess(listCourseOfferingsQuerySchema, {}) as { data: { page: number; limit: number; sortBy: string } };
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
    });

    it("should accept all valid sortBy values", () => {
      for (const val of ["createdAt", "updatedAt", "yearOfStudy", "status"]) {
        expectSuccess(listCourseOfferingsQuerySchema, { sortBy: val });
      }
    });

    it("should accept all valid status filters", () => {
      for (const status of ["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"]) {
        expectSuccess(listCourseOfferingsQuerySchema, { status });
      }
    });
  });
});
