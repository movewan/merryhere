import * as XLSX from "xlsx";

/**
 * 데이터를 엑셀 파일로 다운로드
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string = "Sheet1"
) {
  // 워크북 생성
  const workbook = XLSX.utils.book_new();

  // 데이터를 워크시트로 변환
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 파일 다운로드
  XLSX.writeFile(workbook, `${fileName}.xls`);
}

/**
 * 여러 시트를 포함한 엑셀 파일로 다운로드
 */
export function exportMultiSheetToExcel(
  sheets: Array<{ data: any[]; sheetName: string }>,
  fileName: string
) {
  // 워크북 생성
  const workbook = XLSX.utils.book_new();

  // 각 시트를 워크북에 추가
  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // 파일 다운로드
  XLSX.writeFile(workbook, `${fileName}.xls`);
}
