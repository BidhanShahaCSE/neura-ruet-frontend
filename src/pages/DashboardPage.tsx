import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import { Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  listStudentChatRooms, createStudentChatRoom, listStudentRoomMessages, sendStudentRoomMessage,
} from '@/services/studentChatService';
import {
  listTeacherChatRooms, createTeacherChatRoom, listTeacherRoomMessages, sendTeacherRoomMessage,
} from '@/services/teacherChatService';
import {
  listCRChatRooms, createCRChatRoom, listCRRoomMessages, sendCRRoomMessage,
} from '@/services/crChatService';
import { listCrNotices } from '@/services/crNoticeService';
import { listAllCrMaterials } from '@/services/crMaterialUploadService';
import { listTeacherNotices } from '@/services/teacherNoticeService';
import { listTeacherResultSheetsHistory } from '@/services/teacherResultSheetService';

const DashboardPage = () => {
  const { role, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const suppressNextRoomSplashRef = useRef(false);
  const skipNextFetchRef = useRef(false);

  // CR/Teacher-specific state
  const [crNotices, setCrNotices] = useState<any[]>([]);
  const [crMaterials, setCrMaterials] = useState<any[]>([]);

  const getRoleFns = useCallback(() => {
    if (role === 'teacher') return { listRooms: listTeacherChatRooms, createRoom: createTeacherChatRoom, listMessages: listTeacherRoomMessages, sendMessage: sendTeacherRoomMessage };
    if (role === 'cr') return { listRooms: listCRChatRooms, createRoom: createCRChatRoom, listMessages: listCRRoomMessages, sendMessage: sendCRRoomMessage };
    return { listRooms: listStudentChatRooms, createRoom: createStudentChatRoom, listMessages: listStudentRoomMessages, sendMessage: sendStudentRoomMessage };
  }, [role]);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const data = await getRoleFns().listRooms();
      setChatRooms(Array.isArray(data) ? data : []);
    } catch { }
    setLoadingRooms(false);
  }, [getRoleFns]);

  const fetchSidebarData = useCallback(async () => {
    if (role === 'cr') {
      try {
        const [notices, materials] = await Promise.all([listCrNotices(), listAllCrMaterials()]);
        setCrNotices(notices.map((n: any) => ({ id: n.id, title: n.title })));
        setCrMaterials(materials.map((m: any) => ({
          id: m.id,
          title: m.course_code ? `${m.course_code} - ${m.course_name || ''}` : (m.topic || m.course_name || 'Material'),
          _materialType: m._materialType,
        })));
      } catch { }
    } else if (role === 'teacher') {
      try {
        const [notices, sheets] = await Promise.all([listTeacherNotices(), listTeacherResultSheetsHistory()]);
        setCrNotices(notices.map((n: any) => ({ id: n.id, title: n.title })));
        setCrMaterials(sheets
          .map((s: any) => ({ id: String(s?.id ?? ''), title: s?.title ?? 'Untitled result sheet' }))
          .filter((s: any) => s.id)
        );
      } catch { }
    }
  }, [role]);

  useEffect(() => {
    fetchRooms();
    fetchSidebarData();
  }, [fetchRooms, fetchSidebarData]);

  const fetchMessages = useCallback(async (roomId: string, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const data = await getRoleFns().listMessages(roomId);
      setMessages(Array.isArray(data) ? data : []);
    } catch { }
    if (showLoading) setLoadingMessages(false);
  }, [getRoleFns]);

  useEffect(() => {
    if (currentRoomId) {
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false;
        return;
      }
      const showLoading = !suppressNextRoomSplashRef.current;
      suppressNextRoomSplashRef.current = false;
      fetchMessages(currentRoomId, showLoading);
    } else {
      setMessages([]);
    }
  }, [currentRoomId, fetchMessages]);

  const handleNewChat = async () => {
    setCurrentRoomId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, toolName: string = 'general') => {
    if (!content.trim()) return;

    let roomId = currentRoomId;

    if (!roomId) {
      try {
        const room = await getRoleFns().createRoom();
        if (room?.id) {
          roomId = room.id;
          skipNextFetchRef.current = true;
          setCurrentRoomId(room.id);
          await fetchRooms();
        }
      } catch { return; }
    }

    if (!roomId) return;

    const userMsg = { id: `temp-${Date.now()}`, sender_role: 'user', content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      await getRoleFns().sendMessage(roomId, { tool_name: toolName, content });
      await fetchMessages(roomId, false);
      await fetchRooms();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    }
    setSending(false);
  };

  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setSidebarOpen(false);
  };

  const handleSelectNotice = (noticeId: string) => {
    setSidebarOpen(false);
    navigate(role === 'teacher' ? `/teacher/notices/upload?noticeId=${noticeId}` : `/cr/notices/upload?noticeId=${noticeId}`);
  };

  const handleSelectMaterial = (materialId: string, materialType: string) => {
    setSidebarOpen(false);
    if (role === 'teacher') {
      navigate(`/teacher/results/create?sheetId=${materialId}`);
    } else {
      navigate(`/cr/materials/upload?materialType=${encodeURIComponent(materialType)}&materialId=${materialId}`);
    }
  };

  const handleToolAction = (toolId: string) => {
    if (toolId === 'upload_notice') {
      navigate(role === 'teacher' ? '/teacher/notices/upload' : '/cr/notices/upload');
    } else if (toolId === 'upload_material') {
      navigate('/cr/materials/upload');
    } else if (toolId === 'create_result') {
      navigate('/teacher/results/create');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="hidden lg:block transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: sidebarOpen ? '20rem' : '0', minWidth: sidebarOpen ? '20rem' : '0' }}
      >
        <div className="w-80 h-full">
          <ChatSidebar
            rooms={chatRooms}
            currentRoomId={currentRoomId}
            loading={loadingRooms}
            fullName={profile?.fullName || ''}
            role={role || 'student'}
            onSelectRoom={handleSelectRoom}
            onNewChat={handleNewChat}
            onClose={() => setSidebarOpen(false)}
            notices={crNotices}
            materials={crMaterials}
            onSelectNotice={handleSelectNotice}
            onSelectMaterial={handleSelectMaterial}
          />
        </div>
      </div>
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatSidebar
          rooms={chatRooms}
          currentRoomId={currentRoomId}
          loading={loadingRooms}
          fullName={profile?.fullName || ''}
          role={role || 'student'}
          onSelectRoom={handleSelectRoom}
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
          notices={crNotices}
          materials={crMaterials}
          onSelectNotice={handleSelectNotice}
          onSelectMaterial={handleSelectMaterial}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-4 py-4 z-20"
          style={{ background: 'linear-gradient(to bottom, #000000, rgba(0,0,0,0.75), transparent)' }}
        >
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors ${sidebarOpen ? 'lg:hidden' : ''}`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl leading-none font-medium">
              <span className="text-primary">Neura</span>
              <span className="text-foreground">RUET</span>
            </h2>
          </div>
          {role !== 'teacher' && (
            <button
              onClick={() => navigate('/notifications')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <ChatArea
          messages={messages}
          loading={loadingMessages}
          sending={sending}
          onSendMessage={handleSendMessage}
          onToolAction={handleToolAction}
          role={role || 'student'}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
