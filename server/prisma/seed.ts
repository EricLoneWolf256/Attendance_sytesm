import { PrismaClient, UserRole, UserStatus, ProgrammeLevel, SessionMode, SessionStatus, AttendanceStatus, SignInMethod, CourseOfferingStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  const defaultPassword = await hashPassword("password123");

  // ─── Campuses ─────────────────────────────────────────────────────────────
  const mainCampus = await prisma.campus.create({
    data: { name: "Main Campus - Nkozi", code: "NKZ", address: "Nkozi, Mpigi District" },
  });
  const kampalaCampus = await prisma.campus.create({
    data: { name: "Kampala Campus", code: "KLA", address: "Kampala, Uganda" },
  });
  console.log("✓ Campuses created");

  // ─── Academic Year & Semester ─────────────────────────────────────────────
  const academicYear = await prisma.academicYear.create({
    data: {
      code: "2025/2026",
      label: "2025/2026",
      isCurrent: true,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-07-31"),
    },
  });
  const semesterOne = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      code: "SEM1",
      name: "Semester One",
      intakeMonth: "August",
      isActive: true,
      startDate: new Date("2025-08-15"),
      endDate: new Date("2025-12-15"),
    },
  });
  const semesterTwo = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      code: "SEM2",
      name: "Semester Two",
      intakeMonth: "January",
      isActive: false,
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-05-10"),
    },
  });
  console.log("✓ Academic year & semesters created");

  // ─── Faculty ──────────────────────────────────────────────────────────────
  const facultyOfScience = await prisma.faculty.create({
    data: { name: "Faculty of Science", code: "FST", campusId: mainCampus.id },
  });
  const facultyOfArts = await prisma.faculty.create({
    data: { name: "Faculty of Arts and Social Sciences", code: "FAS", campusId: mainCampus.id },
  });
  const facultyOfBusiness = await prisma.faculty.create({
    data: { name: "Faculty of Business Administration", code: "FBA", campusId: kampalaCampus.id },
  });
  console.log("✓ Faculties created");

  // ─── Departments ──────────────────────────────────────────────────────────
  const deptCS = await prisma.department.create({
    data: { name: "Department of Computer Science", code: "CS", facultyId: facultyOfScience.id },
  });
  const deptMath = await prisma.department.create({
    data: { name: "Department of Mathematics", code: "MATH", facultyId: facultyOfScience.id },
  });
  const deptPhysics = await prisma.department.create({
    data: { name: "Department of Physics", code: "PHY", facultyId: facultyOfScience.id },
  });
  console.log("✓ Departments created");

  // ─── Programmes ───────────────────────────────────────────────────────────
  const bscCS = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Computer Science",
      code: "BSCS",
      departmentId: deptCS.id,
      level: ProgrammeLevel.UNDERGRADUATE,
      durationYears: 4,
    },
  });
  const bscMath = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Mathematics",
      code: "BSCM",
      departmentId: deptMath.id,
      level: ProgrammeLevel.UNDERGRADUATE,
      durationYears: 4,
    },
  });
  const bscPhysics = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Physics",
      code: "BSCP",
      departmentId: deptPhysics.id,
      level: ProgrammeLevel.UNDERGRADUATE,
      durationYears: 4,
    },
  });
  console.log("✓ Programmes created");

  // ─── Courses ──────────────────────────────────────────────────────────────
  const cs101 = await prisma.course.create({
    data: { code: "CS101", title: "Introduction to Programming", creditUnits: 3, departmentId: deptCS.id, level: 1 },
  });
  const cs201 = await prisma.course.create({
    data: { code: "CS201", title: "Data Structures and Algorithms", creditUnits: 3, departmentId: deptCS.id, level: 2 },
  });
  const cs301 = await prisma.course.create({
    data: { code: "CS301", title: "Database Systems", creditUnits: 3, departmentId: deptCS.id, level: 3 },
  });
  const cs302 = await prisma.course.create({
    data: { code: "CS302", title: "Operating Systems", creditUnits: 3, departmentId: deptCS.id, level: 3 },
  });
  const cs401 = await prisma.course.create({
    data: { code: "CS401", title: "Software Engineering", creditUnits: 3, departmentId: deptCS.id, level: 4 },
  });
  const math101 = await prisma.course.create({
    data: { code: "MATH101", title: "Calculus I", creditUnits: 3, departmentId: deptMath.id, level: 1 },
  });
  const math201 = await prisma.course.create({
    data: { code: "MATH201", title: "Linear Algebra", creditUnits: 3, departmentId: deptMath.id, level: 2 },
  });
  console.log("✓ Courses created");

  // ─── Users ────────────────────────────────────────────────────────────────

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Administrator",
      email: "admin@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.SUPER_ADMIN,
      staffNumber: "STF001",
      gender: "Male",
      campusId: mainCampus.id,
      status: UserStatus.ACTIVE,
    },
  });

  // Faculty Admin
  const facultyAdmin = await prisma.user.create({
    data: {
      firstName: "Grace",
      lastName: "Nakamya",
      email: "facultyadmin@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.FACULTY_ADMIN,
      staffNumber: "STF002",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: UserStatus.ACTIVE,
    },
  });

  // Lecturers
  const lecturer1 = await prisma.user.create({
    data: {
      firstName: "James",
      lastName: "Okello",
      email: "lecturer@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.LECTURER,
      staffNumber: "STF003",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: UserStatus.ACTIVE,
    },
  });

  const lecturer2 = await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Achieng",
      email: "lecturer2@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.LECTURER,
      staffNumber: "STF004",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: UserStatus.ACTIVE,
    },
  });

  // Students (Faculty of Science, BSc Computer Science)
  const student1 = await prisma.user.create({
    data: {
      firstName: "Daniel",
      lastName: "Mugisha",
      email: "student@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B291-11845",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Namutebi",
      email: "student2@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B291-11846",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      firstName: "Brian",
      lastName: "Tumusiime",
      email: "student3@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B291-11847",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      firstName: "Christine",
      lastName: "Auma",
      email: "student4@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B291-11848",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });

  const student5 = await prisma.user.create({
    data: {
      firstName: "Martin",
      lastName: "Kizza",
      email: "student5@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B291-11849",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });

  // Additional students for other programmes
  const student6 = await prisma.user.create({
    data: {
      firstName: "Maria",
      lastName: "Nansubuga",
      email: "student6@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      studentNumber: "2024-B292-21850",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscMath.id,
      yearOfStudy: 2,
      status: UserStatus.ACTIVE,
    },
  });
  console.log("✓ Users created");

  // ─── Course Offerings ─────────────────────────────────────────────────────
  const cs101Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs101.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer1.id,
      academicYearId: academicYear.id,
      status: CourseOfferingStatus.ACTIVE,
    },
  });

  const cs201Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs201.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer1.id,
      academicYearId: academicYear.id,
      status: CourseOfferingStatus.ACTIVE,
    },
  });

  const cs301Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs301.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer2.id,
      academicYearId: academicYear.id,
      status: CourseOfferingStatus.ACTIVE,
    },
  });

  const cs302Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs302.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer2.id,
      academicYearId: academicYear.id,
      status: CourseOfferingStatus.ACTIVE,
    },
  });

  const math101Offering = await prisma.courseOffering.create({
    data: {
      courseId: math101.id,
      programmeId: bscMath.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer1.id,
      academicYearId: academicYear.id,
      status: CourseOfferingStatus.ACTIVE,
    },
  });
  console.log("✓ Course offerings created");

  // ─── Enrollments ──────────────────────────────────────────────────────────
  const csStudents = [student1, student2, student3, student4, student5];

  for (const student of csStudents) {
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, courseOfferingId: cs101Offering.id },
        { studentId: student.id, courseOfferingId: cs201Offering.id },
        { studentId: student.id, courseOfferingId: cs301Offering.id },
        { studentId: student.id, courseOfferingId: cs302Offering.id },
      ],
    });
  }

  // Enroll math student in their course
  await prisma.enrollment.create({
    data: { studentId: student6.id, courseOfferingId: math101Offering.id },
  });
  console.log("✓ Enrollments created");

  // ─── Class Rep ────────────────────────────────────────────────────────────
  await prisma.classRep.create({
    data: {
      studentId: student1.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      assignedBy: facultyAdmin.id,
    },
  });
  console.log("✓ Class Rep assigned (Daniel Mugisha for BSc CS Year 2)");

  // ─── Attendance Policy ────────────────────────────────────────────────────
  await prisma.attendancePolicy.create({
    data: { programmeId: null, minPercentage: 75 },
  });
  await prisma.attendancePolicy.create({
    data: { programmeId: bscCS.id, minPercentage: 80 },
  });
  console.log("✓ Attendance policies created");

  // ─── Sample Session (closed, with attendance) ────────────────────────────
  const sessionDate = new Date("2026-01-15");
  const sessionStart = new Date("2026-01-15T08:00:00");
  const sessionEnd = new Date("2026-01-15T09:30:00");

  const session = await prisma.classSession.create({
    data: {
      courseOfferingId: cs101Offering.id,
      startedBy: lecturer1.id,
      date: sessionDate,
      modeOfTeaching: SessionMode.PHYSICAL,
      startTime: sessionStart,
      endTime: sessionEnd,
      duration: 90,
      topic: "Introduction to Variables and Data Types",
      status: SessionStatus.CLOSED,
      closedAt: sessionEnd,
      lecturerConfirmedAt: new Date("2026-01-15T10:00:00"),
      semesterId: semesterOne.id,
    },
  });

  // Attendance records for the sample session
  const signInTimes = [
    new Date("2026-01-15T07:55:00"),
    new Date("2026-01-15T07:58:00"),
    new Date("2026-01-15T08:02:00"),
    new Date("2026-01-15T08:05:00"),
    null, // student5 was absent
  ];

  for (let i = 0; i < csStudents.length; i++) {
    await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: csStudents[i].id,
        status: signInTimes[i] !== null ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
        signedInAt: signInTimes[i],
        signInMethod: SignInMethod.SELF,
      },
    });
  }
  console.log("✓ Sample session with attendance records created");

  // ─── Second sample session (open) ────────────────────────────────────────
  const openSessionDate = new Date("2026-01-20");
  await prisma.classSession.create({
    data: {
      courseOfferingId: cs201Offering.id,
      startedBy: lecturer1.id,
      date: openSessionDate,
      modeOfTeaching: SessionMode.PHYSICAL,
      startTime: new Date("2026-01-20T10:00:00"),
      topic: "Binary Trees and Traversal",
      status: SessionStatus.OPEN,
      semesterId: semesterOne.id,
    },
  });
  console.log("✓ Open sample session created");

  console.log("\n── Seed Complete ──────────────────────────────────");
  console.log("Demo accounts:");
  console.log("  Super Admin:   admin@umu.ac.ug / password123");
  console.log("  Faculty Admin: facultyadmin@umu.ac.ug / password123");
  console.log("  Lecturer:      lecturer@umu.ac.ug / password123");
  console.log("  Student:       student@stud.umu.ac.ug / password123");
  console.log("  Student (rep): student@stud.umu.ac.ug / password123 (Class Rep for BSc CS Yr 2)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
