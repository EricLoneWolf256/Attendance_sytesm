import { PrismaClient, UserRole, ProgrammeLevel, SessionMode, AttendanceStatus, SignInMethod } from "@prisma/client";
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
    data: { name: "Main Campus - Nkozi" },
  });
  const kampalaCampus = await prisma.campus.create({
    data: { name: "Kampala Campus" },
  });
  console.log("✓ Campuses created");

  // ─── Academic Year & Semester ─────────────────────────────────────────────
  const academicYear = await prisma.academicYear.create({
    data: { label: "2025/2026", isCurrent: true },
  });
  const semesterOne = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      name: "Semester One",
      intakeMonth: "August",
      isActive: true,
    },
  });
  const semesterTwo = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      name: "Semester Two",
      intakeMonth: "January",
      isActive: false,
    },
  });
  console.log("✓ Academic year & semesters created");

  // ─── Faculty ──────────────────────────────────────────────────────────────
  const facultyOfScience = await prisma.faculty.create({
    data: { name: "Faculty of Science", campusId: mainCampus.id },
  });
  const facultyOfArts = await prisma.faculty.create({
    data: { name: "Faculty of Arts and Social Sciences", campusId: mainCampus.id },
  });
  const facultyOfBusiness = await prisma.faculty.create({
    data: { name: "Faculty of Business Administration", campusId: kampalaCampus.id },
  });
  console.log("✓ Faculties created");

  // ─── Departments ──────────────────────────────────────────────────────────
  const deptCS = await prisma.department.create({
    data: { name: "Department of Computer Science", facultyId: facultyOfScience.id },
  });
  const deptMath = await prisma.department.create({
    data: { name: "Department of Mathematics", facultyId: facultyOfScience.id },
  });
  const deptPhysics = await prisma.department.create({
    data: { name: "Department of Physics", facultyId: facultyOfScience.id },
  });
  console.log("✓ Departments created");

  // ─── Programmes ───────────────────────────────────────────────────────────
  const bscCS = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Computer Science",
      departmentId: deptCS.id,
      level: ProgrammeLevel.undergraduate,
    },
  });
  const bscMath = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Mathematics",
      departmentId: deptMath.id,
      level: ProgrammeLevel.undergraduate,
    },
  });
  const bscPhysics = await prisma.programme.create({
    data: {
      name: "Bachelor of Science in Physics",
      departmentId: deptPhysics.id,
      level: ProgrammeLevel.undergraduate,
    },
  });
  console.log("✓ Programmes created");

  // ─── Courses ──────────────────────────────────────────────────────────────
  const cs101 = await prisma.course.create({
    data: { code: "CS101", title: "Introduction to Programming", creditUnits: 3, departmentId: deptCS.id },
  });
  const cs201 = await prisma.course.create({
    data: { code: "CS201", title: "Data Structures and Algorithms", creditUnits: 3, departmentId: deptCS.id },
  });
  const cs301 = await prisma.course.create({
    data: { code: "CS301", title: "Database Systems", creditUnits: 3, departmentId: deptCS.id },
  });
  const cs302 = await prisma.course.create({
    data: { code: "CS302", title: "Operating Systems", creditUnits: 3, departmentId: deptCS.id },
  });
  const cs401 = await prisma.course.create({
    data: { code: "CS401", title: "Software Engineering", creditUnits: 3, departmentId: deptCS.id },
  });
  const math101 = await prisma.course.create({
    data: { code: "MATH101", title: "Calculus I", creditUnits: 3, departmentId: deptMath.id },
  });
  const math201 = await prisma.course.create({
    data: { code: "MATH201", title: "Linear Algebra", creditUnits: 3, departmentId: deptMath.id },
  });
  console.log("✓ Courses created");

  // ─── Users ────────────────────────────────────────────────────────────────

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.SUPER_ADMIN,
      staffNumber: "STF001",
      gender: "Male",
      campusId: mainCampus.id,
      status: "active",
    },
  });

  // Faculty Admin
  const facultyAdmin = await prisma.user.create({
    data: {
      name: "Dr. Grace Nakamya",
      email: "facultyadmin@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.ADMIN,
      staffNumber: "STF002",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: "active",
    },
  });

  // Lecturers
  const lecturer1 = await prisma.user.create({
    data: {
      name: "Prof. James Okello",
      email: "lecturer@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.LECTURER,
      staffNumber: "STF003",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: "active",
    },
  });

  const lecturer2 = await prisma.user.create({
    data: {
      name: "Dr. Sarah Achieng",
      email: "lecturer2@umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.LECTURER,
      staffNumber: "STF004",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      status: "active",
    },
  });

  // Students (Faculty of Science, BSc Computer Science)
  const student1 = await prisma.user.create({
    data: {
      name: "Mugisha Daniel",
      email: "student@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B291-11845",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: "active",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Namutebi Sarah",
      email: "student2@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B291-11846",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: "active",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Tumusiime Brian",
      email: "student3@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B291-11847",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: "active",
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Auma Christine",
      email: "student4@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B291-11848",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: "active",
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: "Kizza Martin",
      email: "student5@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B291-11849",
      gender: "Male",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      status: "active",
    },
  });

  // Additional students for other programmes
  const student6 = await prisma.user.create({
    data: {
      name: "Nansubuga Maria",
      email: "student6@stud.umu.ac.ug",
      passwordHash: defaultPassword,
      role: UserRole.STUDENT,
      regNumber: "2024-B292-21850",
      gender: "Female",
      campusId: mainCampus.id,
      facultyId: facultyOfScience.id,
      programmeId: bscMath.id,
      yearOfStudy: 2,
      status: "active",
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
    },
  });

  const cs201Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs201.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer1.id,
    },
  });

  const cs301Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs301.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer2.id,
    },
  });

  const cs302Offering = await prisma.courseOffering.create({
    data: {
      courseId: cs302.id,
      programmeId: bscCS.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer2.id,
    },
  });

  const math101Offering = await prisma.courseOffering.create({
    data: {
      courseId: math101.id,
      programmeId: bscMath.id,
      yearOfStudy: 2,
      semesterId: semesterOne.id,
      lecturerId: lecturer1.id,
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
  console.log("✓ Class Rep assigned (Mugisha Daniel for BSc CS Year 2)");

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
      startedBy: student1.id,
      date: sessionDate,
      modeOfTeaching: SessionMode.physical,
      startTime: sessionStart,
      endTime: sessionEnd,
      duration: 90,
      venue: "Room 301, Faculty of Science",
      topic: "Introduction to Variables and Data Types",
      status: "closed",
      closedAt: sessionEnd,
      lecturerConfirmedAt: new Date("2026-01-15T10:00:00"),
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
        status: signInTimes[i] !== null ? AttendanceStatus.present : AttendanceStatus.absent,
        signedInAt: signInTimes[i],
        signInMethod: SignInMethod.self,
      },
    });
  }
  console.log("✓ Sample session with attendance records created");

  // ─── Second sample session (open) ────────────────────────────────────────
  const openSessionDate = new Date("2026-01-20");
  await prisma.classSession.create({
    data: {
      courseOfferingId: cs201Offering.id,
      startedBy: student1.id,
      date: openSessionDate,
      modeOfTeaching: SessionMode.physical,
      startTime: new Date("2026-01-20T10:00:00"),
      venue: "Room 302, Faculty of Science",
      topic: "Binary Trees and Traversal",
      status: "open",
    },
  });
  console.log("✓ Open sample session created");

  console.log("\n── Seed Complete ──────────────────────────────────");
  console.log("Demo accounts:");
  console.log("  Super Admin:  admin@umu.ac.ug / password123");
  console.log("  Faculty Admin: facultyadmin@umu.ac.ug / password123");
  console.log("  Lecturer:     lecturer@umu.ac.ug / password123");
  console.log("  Student:      student@stud.umu.ac.ug / password123");
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
