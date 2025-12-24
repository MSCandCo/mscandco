/**
 * Excel Utilities for MSC & Co
 */

import ExcelJS from 'exceljs';

export async function exportToExcel(data, filename = 'export.xlsx') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  if (data && data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 15
    }));

    data.forEach(row => {
      worksheet.addRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export function downloadExcelFile(buffer, filename) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function downloadSingleReleaseExcel(release) {
  const data = [release];
  const buffer = await exportToExcel(data, 'release.xlsx');
  downloadExcelFile(buffer, `release-${release.id}.xlsx`);
}

export async function downloadMultipleReleasesExcel(releases) {
  const buffer = await exportToExcel(releases, 'releases.xlsx');
  downloadExcelFile(buffer, 'releases.xlsx');
}
