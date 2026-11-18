/**
 * Utility untuk mengekspor data ke format CSV (Comma-Separated Values)
 * Dilengkapi UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel (Windows & Mac)
 */

export const downloadCsv = (filename, rows) => {
  if (!rows || !rows.length) return;

  const processRow = (row) =>
    row
      .map((val) => {
        let text = val === null || val === undefined ? '' : String(val);
        // Escape tanda kutip ganda
        text = text.replace(/"/g, '""');
        // Bungkus dengan tanda kutip jika terdapat koma, newline, atau kutip
        if (text.search(/("|,|\n|\r)/g) >= 0) {
          text = `"${text}"`;
        }
        return text;
      })
      .join(',');

  // Menambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel langsung mengenali encoding UTF-8
  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

