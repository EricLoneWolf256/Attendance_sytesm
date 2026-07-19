import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  await prisma.attendanceRecord.deleteMany();
  await prisma.qRSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.lecturerProfile.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding database...");
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@ugm.ac.ug",
      passwordHash: password,
      firstName: "Grace",
      lastName: "Nambatya",
      role: Role.ADMIN,
    },
  });

  const faculty = await prisma.faculty.create({
    data: { name: "Faculty of Science", code: "FOS" },
  });

  const department = await prisma.department.create({
    data: { name: "Department of Computer Science", code: "DCS", facultyId: faculty.id },
  });

  const program = await prisma.program.create({
    data: { name: "Bachelor of Science in Computer Science", code: "BSC-CS", departmentId: department.id, level: "Undergraduate" },
  });

  const semester = await prisma.semester.create({
    data: {
      name: "Semester 1, 2026",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });

  const lecturer = await prisma.user.create({
    data: {
      email: "lecturer@ugm.ac.ug",
      passwordHash: password,
      firstName: "John",
      lastName: "Mugisha",
      role: Role.LECTURER,
    },
  });

  const lecturerProfile = await prisma.lecturerProfile.create({
    data: { userId: lecturer.id, staffId: "LEC001" },
  });

  const course = await prisma.course.create({
    data: {
      name: "Introduction to Programming",
      code: "CS101",
      semesterId: semester.id,
      programId: program.id,
      lecturerId: lecturerProfile.id,
    },
  });

  const studentNames = [
    { firstName: "Sarah", lastName: "Nalubega" },
    { firstName: "David", lastName: "Okello" },
    { firstName: "Faith", lastName: "Namukasa" },
    { firstName: "Brian", lastName: "Tumwine" },
    { firstName: "Joyce", lastName: "Achieng" },
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i + 1}@ugm.ac.ug`,
        passwordHash: password,
        firstName: studentNames[i].firstName,
        lastName: studentNames[i].lastName,
        role: Role.STUDENT,
      },
    });

    const profile = await prisma.studentProfile.create({
      data: {
        userId: student.id,
        studentNumber: `2026/HD/CS/${String(i + 1).padStart(4, "0")}`,
        programId: program.id,
        yearOfStudy: 1,
      },
    });

    await prisma.enrollment.create({
      data: { studentId: profile.id, courseId: course.id },
    });

    students.push(student);
  }

  console.log("Seed complete!");
  console.log("Admin: admin@ugm.ac.ug / password123");
  console.log("Lecturer: lecturer@ugm.ac.ug / password123");
  console.log("Students: student1-5@ugm.ac.ug / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
