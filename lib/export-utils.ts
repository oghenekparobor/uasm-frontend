/**
 * Export data to CSV format
 */
export function exportToCSV<T>(
  data: T[],
  columns: Array<{ key: string; header: string; render?: (item: T) => string | React.ReactNode }>,
  filename: string = 'export.csv'
): void {
  // Create CSV header
  const headers = columns.map((col) => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let value: string;
        if (col.render) {
          const rendered = col.render(item);
          // If render returns React node, convert to string
          if (typeof rendered === 'string') {
            value = rendered;
          } else {
            // For React nodes, try to extract text content
            value = String((item as any)[col.key] || '');
          }
        } else {
          value = String((item as any)[col.key] || '');
        }
        // Escape commas and quotes in CSV
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(
  data: T[],
  filename: string = 'export.json'
): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export selected rows to CSV
 */
export function exportSelectedToCSV<T>(
  data: T[],
  selectedIds: string[],
  keyExtractor: (item: T) => string,
  columns: Array<{ key: string; header: string; render?: (item: T) => string | React.ReactNode }>,
  filename: string = 'export.csv'
): void {
  const selectedData = data.filter((item) =>
    selectedIds.includes(keyExtractor(item))
  );
  exportToCSV(selectedData, columns, filename);
}

