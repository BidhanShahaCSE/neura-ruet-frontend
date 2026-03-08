import API from '../utils/api/apiClient';

export async function createCRChatRoom(payload = {}) {
  const response = await API.post('/api/v1/crs/chat/rooms', payload);
  return response?.data;
}

export async function listCRChatRooms() {
  const response = await API.get('/api/v1/crs/chat/rooms');
  return response?.data;
}

export async function listCRRoomMessages(roomId: string) {
  const response = await API.get(`/api/v1/crs/chat/rooms/${roomId}/messages`);
  return response?.data;
}

export async function sendCRRoomMessage(roomId: string, payload: { tool_name: string; content: string }) {
  const response = await API.post(`/api/v1/crs/chat/rooms/${roomId}/messages`, payload);
  return response?.data;
}
