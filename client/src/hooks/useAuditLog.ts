import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AuditLogRecord {
  id: string;
  actorId: string;
  action: string;
  targetTable: string;
  targetId: string;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogFilters {
  targetTable?: string;
  actorId?: string;
  limit?: number;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.targetTable) params.set("targetTable", filters.targetTable);
      if (filters?.actorId) params.set("actorId", filters.actorId);
      if (filters?.limit) params.set("limit", String(filters.limit));
      const qs = params.toString();
      const { data } = await api.get<{ logs: AuditLogRecord[] }>(`/audit${qs ? `?${qs}` : ""}`);
      return data.logs;
    },
  });
}
