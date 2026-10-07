import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportReport, type ExportFormat, type ExportRow } from "@/lib/exports";

export function ExportMenu({ title, filename, rows, summary }: { title: string; filename: string; rows: ExportRow[]; summary?: string[] }) {
  const run = (format: ExportFormat) => exportReport(format, { title, filename, rows, ...(summary ? { summary } : {}) });
  return <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="outline" disabled={!rows.length}><Download className="h-4 w-4" /> Export</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Download report</DropdownMenuLabel><DropdownMenuItem onClick={() => run("csv")}><FileText /> CSV</DropdownMenuItem><DropdownMenuItem onClick={() => run("xlsx")}><FileSpreadsheet /> Excel (.xlsx)</DropdownMenuItem><DropdownMenuItem onClick={() => run("pdf")}><FileText /> PDF</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
