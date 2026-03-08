import API from '../utils/api/apiClient';

export async function createTeacherChatRoom(payload = {}) {
  const response = await API.post('/api/v1/teachers/chat/rooms', payload);
  return response?.data;
}

export async function listTeacherChatRooms() {
  const response = await API.get('/api/v1/teachers/chat/rooms');
  return response?.data;
}

export async function listTeacherRoomMessages(roomId: string) {
  const response = await API.get(`/api/v1/teachers/chat/rooms/${roomId}/messages`);
  return response?.data;
}

export async function sendTeacherRoomMessage(roomId: string, payload: { tool_name: string; content: string }) {
  const response = await API.post(`/api/v1/teachers/chat/rooms/${roomId}/messages`, payload);
  return response?.data;
}
