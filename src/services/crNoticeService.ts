import API from '../utils/api/apiClient';

interface NoticeResponse {
  id: string;
  title: string;
  notice_message: string;
  created_by_role?: string;
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

export async function createCrNotice(payload: { title: string; notice_message: string }): Promise<NoticeResponse> {
  const response = await API.post('/api/v1/cr/notices', payload);
  return assertNoticeResponse(response?.data);
}

export async function listCrNotices(params: { skip?: number; limit?: number } = {}): Promise<NoticeResponse[]> {
  const response = await API.get('/api/v1/cr/notices', { params });
  const data = response?.data;
  if (!Array.isArray(data)) return [];
  return data.map(assertNoticeResponse);
}

export async function listCrNoticeFeed(params: { skip?: number; limit?: number } = {}): Promise<NoticeResponse[]> {
  const response = await API.get('/api/v1/cr/notices/feed', { params });
  const data = response?.data;
  if (!Array.isArray(data)) return [];
  return data.map(assertNoticeResponse);
}

export async function getCrNoticeById(noticeId: string): Promise<NoticeResponse> {
  const id = String(noticeId ?? '').trim();
  if (!id) throw new Error('Missing notice id');
  const response = await API.get(`/api/v1/cr/notices/${encodeURIComponent(id)}`);
  return assertNoticeResponse(response?.data);
}

export async function updateCrNotice(noticeId: string, payload: { title: string; notice_message: string }): Promise<NoticeResponse> {
  const id = String(noticeId ?? '').trim();
  if (!id) throw new Error('Missing notice id');
  const response = await API.patch(`/api/v1/cr/notices/${encodeURIComponent(id)}`, payload);
  return assertNoticeResponse(response?.data);
}
