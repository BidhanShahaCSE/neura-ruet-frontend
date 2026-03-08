import API from '../utils/api/apiClient';

export async function createTeacherResultSheet(payload: {
  ct_no: number;
  course_code: string;
  course_name: string;
  dept: string;
  section: string | null;
  series: number;
  starting_roll: string;
  ending_roll: string;
}) {
  const response = await API.post('/api/v1/result-sheets/', payload);
  return response?.data;
}

export async function batchUpsertTeacherResultEntries(
  sheetId: string,
  payload: { entries: { roll_no: string; marks: string }[] }
) {
  const response = await API.post(`/api/v1/result-sheets/${sheetId}/entries/batch`, payload);
  return response?.data;
}

export async function getTeacherResultSheetById(sheetId: string) {
  const response = await API.get(`/api/v1/result-sheets/get-by-id/${sheetId}`);
  return response?.data;
}

export async function listTeacherResultSheetsHistory() {
  const response = await API.get('/api/v1/result-sheets/get-all');
  const data = response?.data;
  return Array.isArray(data) ? data : [];
}

export async function updateTeacherResultSheet(sheetId: string, payload: any) {
  const response = await API.patch(`/api/v1/result-sheets/${sheetId}`, payload);
  return response?.data;
}
