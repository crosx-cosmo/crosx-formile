import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export type ExportRow = Record<string, string | number | boolean | null | undefined>;
export type ExportFormat = "csv" | "xlsx" | "pdf";

type ExportOptions = { title: string; filename: string; rows: ExportRow[]; summary?: string[] };

function columns(rows: ExportRow[]) { return Array.from(new Set(rows.flatMap((row) => Object.keys(row)))); }
function safeName(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function download(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

export function exportReport(format: ExportFormat, options: ExportOptions) {
  const cols = columns(options.rows);
  const base = safeName(options.filename || options.title) || "formile-report";
  if (format === "csv") {
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [cols.map(escape).join(","), ...options.rows.map((row) => cols.map((col) => escape(row[col])).join(","))];
    download(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${base}.csv`);
    return;
  }
  if (format === "xlsx") {
    const sheet = XLSX.utils.json_to_sheet(options.rows, { header: cols });
    sheet["!cols"] = cols.map((col) => ({ wch: Math.min(42, Math.max(col.length + 2, 14)) }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Report"); XLSX.writeFile(book, `${base}.xlsx`);
    return;
  }
  const doc = new jsPDF({ orientation: cols.length > 6 ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth(); const margin = 42; let y = 48;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(options.title, margin, y); y += 22;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100); doc.text(`Generated ${new Date().toLocaleString()}`, margin, y); y += 16;
  for (const item of options.summary ?? []) { doc.text(item, margin, y); y += 12; }
  doc.setTextColor(20); const colWidth = (width - margin * 2) / Math.max(cols.length, 1);
  const drawHeader = () => { doc.setFillColor(238, 48, 55); doc.rect(margin, y - 10, width - margin * 2, 18, "F"); doc.setTextColor(255); doc.setFont("helvetica", "bold"); cols.forEach((col, i) => doc.text(doc.splitTextToSize(col, colWidth - 6)[0] ?? col, margin + i * colWidth + 3, y + 2)); doc.setTextColor(25); doc.setFont("helvetica", "normal"); y += 18; };
  drawHeader();
  for (const row of options.rows) {
    if (y > doc.internal.pageSize.getHeight() - 44) { doc.addPage(); y = 48; drawHeader(); }
    const lines = cols.map((col) => doc.splitTextToSize(String(row[col] ?? ""), colWidth - 6));
    const height = Math.max(20, ...lines.map((line) => line.length * 9 + 6));
    doc.setDrawColor(225); doc.rect(margin, y - 10, width - margin * 2, height);
    lines.forEach((line, i) => doc.text(line.slice(0, 5), margin + i * colWidth + 3, y)); y += height;
  }
  doc.save(`${base}.pdf`);
}
