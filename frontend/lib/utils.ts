export function formatScore(score: number, decimals = 4): string {
  return score.toFixed(decimals);
}

export function getScoreColor(score: number): string {
  if (score < 0.3) return "text-green-600";
  if (score < 0.5) return "text-yellow-600";
  if (score < 0.7) return "text-orange-600";
  return "text-red-600";
}

export function getScoreBgColor(score: number): string {
  if (score < 0.3) return "bg-green-100";
  if (score < 0.5) return "bg-yellow-100";
  if (score < 0.7) return "bg-orange-100";
  return "bg-red-100";
}

export function getScoreLabel(score: number): string {
  if (score < 0.3) return "Low Risk";
  if (score < 0.5) return "Moderate Risk";
  if (score < 0.7) return "High Risk";
  return "Very High Risk";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function truncateText(text: string, length: number = 100): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsv(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatDate(date: Date): string {
  return date.toLocaleString();
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
