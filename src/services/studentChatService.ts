import API from '../utils/api/apiClient';

export async function createStudentChatRoom(payload = {}) {
  const response = await API.post('/api/v1/students/chat/rooms', payload);
  return response?.data;
}

export async function listStudentChatRooms() {
  const response = await API.get('/api/v1/students/chat/rooms');
  return response?.data;
}

export async function listStudentRoomMessages(roomId: string) {
  const response = await API.get(`/api/v1/students/chat/rooms/${roomId}/messages`);
  return response?.data;
}

export async function sendStudentRoomMessage(roomId: string, payload: { tool_name: string; content: string }) {
  const response = await API.post(`/api/v1/students/chat/rooms/${roomId}/messages`, payload);
  return response?.data;
}

export async function ensureStudentHasAtLeastOneRoom() {
  const rooms = await listStudentChatRooms();
  if (Array.isArray(rooms) && rooms.length > 0) return rooms;
  await createStudentChatRoom();
  return await listStudentChatRooms();
}
