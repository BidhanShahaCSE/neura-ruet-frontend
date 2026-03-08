import API from '../utils/api/apiClient';

interface NoticeResponse {
  id: string;
  title: string;
  notice_message: string;
  dept?: string;
  sec?: string | null;
  series?: string | number;
  created_at?: string;
  updated_at?: string;
}

function assertNoticeResponse(obj: any): NoticeResponse {
  if (!obj || typeof obj !== 'object') throw new Error('Invalid notice response');
  if (!obj.id) throw new Error('Invalid notice response: missing id');
  if (typeof obj.title !== 'string') throw new Error('Invalid notice response: missing title');
  if (typeof obj.notice_message !== 'string') throw new Error('Invalid notice response: missing notice_message');
  return obj;
}

export async function createTeacherNotice(payload: {
  title: string;
  notice_message: string;
  dept: string;
  sec: string | null;
  series: string;
}): Promise<NoticeResponse> {
  const response = await API.post('/api/v1/teacher/notices', payload);
  return assertNoticeResponse(response?.data);
}

export async function listTeacherNotices(params: { skip?: number; limit?: number } = {}): Promise<NoticeResponse[]> {
  const response = await API.get('/api/v1/teacher/notices', { params });
  const data = response?.data;
  if (!Array.isArray(data)) return [];
  return data.map(assertNoticeResponse);
}

export async function getTeacherNoticeById(noticeId: string): Promise<NoticeResponse> {
  const id = String(noticeId ?? '').trim();
  if (!id) throw new Error('Missing notice id');
  const response = await API.get(`/api/v1/teacher/notices/${encodeURIComponent(id)}`);
  return assertNoticeResponse(response?.data);
}

export async function updateTeacherNotice(noticeId: string, payload: {
  title: string;
  notice_message: string;
  dept: string;
  sec: string | null;
  series: string;
}): Promise<NoticeResponse> {
  const id = String(noticeId ?? '').trim();
  if (!id) throw new Error('Missing notice id');
  const response = await API.patch(`/api/v1/teacher/notices/${encodeURIComponent(id)}`, payload);
  return assertNoticeResponse(response?.data);
}
