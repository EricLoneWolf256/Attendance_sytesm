import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useCourseOfferings } from "../../hooks/useCourseOfferings";
import { useProgrammes } from "../../hooks/useProgrammes";

interface StudentSummary {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  percentage: number;
  student: {
    id: string;
    name: string;
    email: string;
    regNumber: string | null;
  } | null;
}

interface BelowThresholdEntry {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  percentage: number;
  threshold: number;
  student: {
    id: string;
    name: string;
    email: string;
    regNumber: string | null;
  } | null;
}

function getColorClass(pct: number): string {
  if (pct >= 75) return "text-green-600 bg-green-50";
  if (pct >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

function getBarColor(pct: number): string {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "below-threshold">("summary");
  const [courseOfferingId, setCourseOfferingId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [studentReg, setStudentReg] = useState("");

  const { data: courseOfferings } = useCourseOfferings();
  const { data: programmes } = useProgrammes();

  const summaryParams = new URLSearchParams();
  if (courseOfferingId) summaryParams.set("courseOfferingId", courseOfferingId);
  if (programmeId) summaryParams.set("programmeId", programmeId);
  if (yearOfStudy) summaryParams.set("yearOfStudy", yearOfStudy);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["attendanceSummary", courseOfferingId, programmeId, yearOfStudy],
    queryFn: async () => {
      const qs = summaryParams.toString();
      const { data } = await api.get<{ summary: StudentSummary[] }>(
        `/reports/attendance-summary${qs ? `?${qs}` : ""}`
      );
      return data.summary;
    },
  });

  const thresholdParams = new URLSearchParams();
  if (programmeId) thresholdParams.set("programmeId", programmeId);

  const { data: thresholdData, isLoading: thresholdLoading } = useQuery({
    queryKey: ["belowThreshold", programmeId],
    queryFn: async () => {
      const qs = thresholdParams.toString();
      const { data } = await api.get<{ belowThreshold: BelowThresholdEntry[] }>(
        `/reports/below-threshold${qs ? `?${qs}` : ""}`
      );
      return data.belowThreshold;
    },
  });

  const filteredSummary = summaryData?.filter((s) => {
    if (!studentReg) return true;
    const reg = s.student?.regNumber?.toLowerCase() || "";
    return reg.includes(studentReg.toLowerCase());
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600">Attendance summary and threshold monitoring.</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("summary")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "summary"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Attendance Summary
        </button>
        <button
          onClick={() => setActiveTab("below-threshold")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "below-threshold"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Below Threshold
          {thresholdData && thresholdData.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {thresholdData.length}
            </span>
          )}
        </button>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Offering</label>
            <select
              value={courseOfferingId}
              onChange={(e) => setCourseOfferingId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courseOfferings?.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.course?.code} - {co.course?.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Programme</label>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Programmes</option>
              {programmes?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year of Study</label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Reg. Number</label>
            <input
              type="text"
              value={studentReg}
              onChange={(e) => setStudentReg(e.target.value)}
              placeholder="Search by reg number..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {activeTab === "summary" && (
        <div>
          {summaryLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : !filteredSummary || filteredSummary.length === 0 ? (
            <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
              No attendance data found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reg. Number
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total Sessions
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Attended
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSummary.map((record) => (
                    <tr key={record.studentId} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        {record.student?.name || "Unknown"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {record.student?.regNumber || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">
                        {record.totalSessions}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">
                        {record.presentCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getColorClass(
                              record.percentage
                            )}`}
                          >
                            {record.percentage.toFixed(1)}%
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full ${getBarColor(record.percentage)}`}
                              style={{ width: `${Math.min(record.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "below-threshold" && (
        <div>
          {thresholdLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : !thresholdData || thresholdData.length === 0 ? (
            <div className="rounded-md bg-green-50 p-6 text-center text-sm text-green-700">
              All students are meeting their attendance thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reg. Number
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Attended
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Attendance %
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Threshold
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                      Deficit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {thresholdData.map((record) => {
                    const deficit = record.threshold - record.percentage;
                    return (
                      <tr key={record.studentId} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {record.student?.name || "Unknown"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {record.student?.regNumber || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">
                          {record.presentCount} / {record.totalSessions}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                            {record.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-500">
                          {record.threshold}%
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-red-600">
                          -{deficit.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
