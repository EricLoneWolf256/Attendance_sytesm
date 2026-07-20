import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

interface ImportResult {
  imported: number;
  errors: Array<{ row: number; error: string }>;
}

export function useUploadCsv() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<ImportResult>("/import/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });
}
