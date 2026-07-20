import { useState } from "react";
import { useAuditLogs, type AuditLogRecord } from "../../hooks/useAuditLog";

const TARGET_TABLES = [
  "",
  "users",
  "campuses",
  "faculties",
  "departments",
  "programmes",
  "courses",
  "course_offerings",
  "enrollments",
  "class_reps",
  "class_sessions",
  "attendance_records",
  "attendance_policies",
];

function JsonViewer({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return <span className="text-gray-400">—</span>;
  return (
    <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs text-gray-600">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function AuditLogPage() {
  const [targetTable, setTargetTable] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading, error } = useAuditLogs({
    targetTable: targetTable || undefined,
    limit: 100,
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-600">Track all system changes and actions.</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Table</label>
            <select
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Tables</option>
              {TARGET_TABLES.filter(Boolean).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load audit logs</div>
      ) : !logs || logs.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">
          No audit logs found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log: AuditLogRecord) => {
                const isExpanded = expandedId === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className="font-medium text-gray-900">{log.actor.name}</span>
                        <span className="ml-1 text-gray-400">({log.actor.email})</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        <span className="text-gray-700">{log.targetTable}</span>
                        <span className="ml-1 text-gray-400 text-xs">({log.targetId.slice(0, 8)}...)</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {isExpanded ? "▼" : "▶"}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={5} className="bg-gray-50 px-4 py-3">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Before</p>
                              <JsonViewer data={log.beforeJson} />
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-medium uppercase text-gray-500">After</p>
                              <JsonViewer data={log.afterJson} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
