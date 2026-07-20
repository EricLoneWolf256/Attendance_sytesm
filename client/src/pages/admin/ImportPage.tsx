import { useState, useRef } from "react";
import { useUploadCsv } from "../../hooks/useImport";

interface PreviewRow {
  name: string;
  email: string;
  password?: string;
  regNumber: string;
  gender: string;
  campusId: string;
  facultyId: string;
  programmeId: string;
  yearOfStudy: string;
}

function parseCsvPreview(text: string): PreviewRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1, 11).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return {
      name: row["name"] || "",
      email: row["email"] || "",
      password: row["password"],
      regNumber: row["regnumber"] || "",
      gender: row["gender"] || "",
      campusId: row["campusid"] || "",
      facultyId: row["facultyid"] || "",
      programmeId: row["programmeid"] || "",
      yearOfStudy: row["yearofstudy"] || "",
    };
  });
}

function downloadSampleCsv() {
  const csv = [
    "name,email,password,regNumber,gender,campusId,facultyId,programmeId,yearOfStudy",
    "John Doe,john@example.com,,UMU/2024/001,Male,camp01,fac01,prog01,1",
    "Jane Smith,jane@example.com,mypassword,UMU/2024/002,Female,camp01,fac01,prog01,2",
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadCsv();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.trim().split("\n");
      setTotalRows(Math.max(lines.length - 1, 0));
      setPreview(parseCsvPreview(text));
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      await uploadMutation.mutateAsync(file);
    } catch {
      // error handled via mutation state
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setTotalRows(0);
    uploadMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const result = uploadMutation.data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Students</h1>
          <p className="text-sm text-gray-600">Bulk import students from a CSV file.</p>
        </div>
        <button
          onClick={downloadSampleCsv}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Download Template
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            File: <span className="font-medium">{file.name}</span> ({totalRows} rows detected)
            {totalRows > 10 && (
              <span className="ml-2 text-blue-500">(showing first 10 rows)</span>
            )}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Preview</h3>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Reg Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Gender</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Campus ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Faculty ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Programme ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-2 text-gray-900">{row.name}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.email}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.regNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.gender}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.campusId}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.facultyId}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.programmeId}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.yearOfStudy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {uploadMutation.isError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Import failed"}
          </div>
        )}

        {result && (
          <div className="mb-6 space-y-3">
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              Successfully imported <span className="font-bold">{result.imported}</span> student(s).
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                <p className="mb-2 font-medium">{result.errors.length} error(s) encountered:</p>
                <ul className="list-inside list-disc space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || uploadMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadMutation.isPending ? "Importing..." : "Import Students"}
          </button>
          {file && (
            <button
              onClick={handleReset}
              disabled={uploadMutation.isPending}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
