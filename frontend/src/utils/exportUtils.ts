import toast from 'react-hot-toast';

export const exportToCSV = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) {
    toast.error('No data to export');
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Successfully exported ${filename}.csv`);
};

export const exportToPDFSimulation = (title: string, count: number) => {
  toast.loading(`Generating PDF report for ${title}...`, { duration: 1500 });
  setTimeout(() => {
    toast.success(`PDF report for "${title}" downloaded (${count} records)`);
  }, 1600);
};
