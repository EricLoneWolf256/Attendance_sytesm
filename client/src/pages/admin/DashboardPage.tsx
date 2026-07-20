import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DashboardStats {
  users: number;
  campuses: number;
  faculties: number;
  departments: number;
  programmes: number;
  courses: number;
  courseOfferings: number;
  enrollments: number;
  classReps: number;
  academicYears: number;
  usersByRole: { name: string; value: number }[];
  recentUsers: { name: string; email: string; role: string; createdAt: string }[];
  genderDistribution: { name: string; value: number }[];
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [usersRes, campuses, faculties, departments, programmes, courses, courseOfferings, enrollments, classReps, academicYears] = await Promise.allSettled([
        api.get<{ users: { role: string; name: string; email: string; createdAt: string; gender: string | null }[] }>("/users"),
        api.get<{ campuses: unknown[] }>("/campuses").catch(() => ({ data: { campuses: [] } })),
        api.get<{ faculties: unknown[] }>("/faculties").catch(() => ({ data: { faculties: [] } })),
        api.get<{ departments: unknown[] }>("/departments"),
        api.get<{ programmes: unknown[] }>("/programmes"),
        api.get<{ courses: unknown[] }>("/courses"),
        api.get<{ courseOfferings: unknown[] }>("/course-offerings"),
        api.get<{ enrollments: unknown[] }>("/enrollments").catch(() => ({ data: { enrollments: [] } })),
        api.get<{ classReps: unknown[] }>("/class-reps").catch(() => ({ data: { classReps: [] } })),
        api.get<{ years: unknown[] }>("/academic/years").catch(() => ({ data: { years: [] } })),
      ]);

      const allUsers = usersRes.status === "fulfilled" ? usersRes.value.data.users : [];
      const totalUsers = allUsers.length;

      const roleCount: Record<string, number> = {};
      allUsers.forEach((u) => { roleCount[u.role] = (roleCount[u.role] || 0) + 1; });
      const usersByRole = Object.entries(roleCount).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
      }));

      const genderCount: Record<string, number> = { Male: 0, Female: 0, Other: 0, Unspecified: 0 };
      allUsers.forEach((u) => {
        if (u.gender === "Male") genderCount.Male++;
        else if (u.gender === "Female") genderCount.Female++;
        else if (u.gender === "Other") genderCount.Other++;
        else genderCount.Unspecified++;
      });
      const genderDistribution = Object.entries(genderCount)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

      const recentUsers = allUsers
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((u) => ({ name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));

      return {
        users: totalUsers,
        campuses: campuses.status === "fulfilled" ? campuses.value.data.campuses.length : 0,
        faculties: faculties.status === "fulfilled" ? faculties.value.data.faculties.length : 0,
        departments: departments.status === "fulfilled" ? departments.value.data.departments.length : 0,
        programmes: programmes.status === "fulfilled" ? programmes.value.data.programmes.length : 0,
        courses: courses.status === "fulfilled" ? courses.value.data.courses.length : 0,
        courseOfferings: courseOfferings.status === "fulfilled" ? courseOfferings.value.data.courseOfferings.length : 0,
        enrollments: enrollments.status === "fulfilled" ? enrollments.value.data.enrollments.length : 0,
        classReps: classReps.status === "fulfilled" ? classReps.value.data.classReps.length : 0,
        academicYears: academicYears.status === "fulfilled" ? academicYears.value.data.years.length : 0,
        usersByRole,
        genderDistribution,
        recentUsers,
      } as DashboardStats;
    },
  });

  const statCards = [
    { label: "Users", value: stats?.users, icon: "users" as const },
    { label: "Campuses", value: stats?.campuses, icon: "campus" as const },
    { label: "Faculties", value: stats?.faculties, icon: "faculty" as const },
    { label: "Departments", value: stats?.departments, icon: "dept" as const },
    { label: "Programmes", value: stats?.programmes, icon: "programme" as const },
    { label: "Courses", value: stats?.courses, icon: "course" as const },
    { label: "Offerings", value: stats?.courseOfferings, icon: "offering" as const },
    { label: "Enrollments", value: stats?.enrollments, icon: "enrollment" as const },
    { label: "Class Reps", value: stats?.classReps, icon: "rep" as const },
    { label: "Academic Years", value: stats?.academicYears, icon: "year" as const },
  ];

  const roleColors = ["#FF0000", "#FFCD00", "#0A0A0A", "#6B7280"];
  const genderColors = ["#FF0000", "#FFCD00", "#0A0A0A", "#6B7280"];

  const roleBadge: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-800",
    ADMIN: "bg-blue-100 text-blue-800",
    LECTURER: "bg-green-100 text-green-800",
    STUDENT: "bg-gray-100 text-gray-800",
  };

  const cardIcon = (icon: string) => {
    const cls = "h-5 w-5";
    switch (icon) {
      case "users":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case "campus":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>;
      case "faculty":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>;
      case "dept":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>;
      case "programme":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
      case "course":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
      case "offering":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h10"/></svg>;
      case "enrollment":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
      case "rep":
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
      default:
        return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    }
  };

  const academicData = [
    { name: "Faculties", value: stats?.faculties ?? 0 },
    { name: "Departments", value: stats?.departments ?? 0 },
    { name: "Programmes", value: stats?.programmes ?? 0 },
    { name: "Courses", value: stats?.courses ?? 0 },
    { name: "Offerings", value: stats?.courseOfferings ?? 0 },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <img src="/UMU-logo.png" alt="UMU" className="h-10 w-10 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-700">{user?.name}</span>. Here is your system overview.
          </p>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
            <div className="h-72 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-gray-100" />
          </div>
        </>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-umu-red/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{card.label}</span>
                  <span className="text-gray-300 transition-colors group-hover:text-umu-red">
                    {cardIcon(card.icon)}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">{card.value ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Users by Role — Pie Chart */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Users by Role</h2>
              {stats?.usersByRole && stats.usersByRole.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.usersByRole}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ value: v }) => `${v}`}
                    >
                      {stats.usersByRole.map((_, i) => (
                        <Cell key={i} fill={roleColors[i % roleColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No data</p>
              )}
            </div>

            {/* Gender Distribution — Pie Chart */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Gender Distribution</h2>
              {stats?.genderDistribution && stats.genderDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.genderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ value: v }) => `${v}`}
                    >
                      {stats.genderDistribution.map((_, i) => (
                        <Cell key={i} fill={genderColors[i % genderColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No data</p>
              )}
            </div>

            {/* Academic Structure — Bar Chart */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Academic Structure</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={academicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}`, "Count"]} />
                  <Bar dataKey="value" fill="#FF0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Users */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Recent Users</h2>
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[u.role] ?? ""}`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No users yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
