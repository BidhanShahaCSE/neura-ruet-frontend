import API from '../utils/api/apiClient';

interface NoticeResponse {
  id: string;
  title: string;
  notice_message: string;
  created_by_role?: string;
  created_at?: string;
  updated_at?: string;
}

// CR notice feed
export async function listCrNoticeFeed(params: { skip?: number; limit?: number } = {}): Promise<NoticeResponse[]> {
  const response = await API.get('/api/v1/cr/notices/feed', { params });
  const data = response?.data;
  if (!Array.isArray(data)) return [];
  return data;
}

// Student notice feed
export async function listStudentNoticesFeed(params: { skip?: number; limit?: number } = {}): Promise<NoticeResponse[]> {
  const response = await API.get('/api/v1/student/notices/feed', { params });
  const data = response?.data;
  if (!Array.isArray(data)) return [];
  return data;
}
