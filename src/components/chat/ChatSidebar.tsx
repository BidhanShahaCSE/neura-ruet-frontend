import React, { useState } from 'react';
import { MessageSquarePlus, Search, Settings, LogOut, PanelLeftClose, User, ChevronDown, Bell, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ChatRoom {
  id: string;
  title?: string;
  created_at?: string;
}

interface SidebarItem {
  id: string;
  title?: string;
  _materialType?: string;
}

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  loading: boolean;
  fullName: string;
  role: string;
  onSelectRoom: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  // CR-specific
  notices?: SidebarItem[];
  materials?: SidebarItem[];
  selectedNoticeId?: string | null;
  selectedMaterialId?: string | null;
  onSelectNotice?: (id: string) => void;
  onSelectMaterial?: (id: string, materialType: string) => void;
}

const SectionList: React.FC<{
  title: string;
  items: SidebarItem[];
  activeId: string | null;
  onPress: (item: SidebarItem) => void;
  searchText: string;
}> = ({ title, items, activeId, onPress, searchText }) => {
  const filtered = searchText
    ? items.filter((i) => i.title?.toLowerCase().includes(searchText.toLowerCase()))
    : items;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <p className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        {title}
      </p>
      <div className="overflow-y-auto flex-1 min-h-0">
        {filtered.length === 0 ? (
          <p className="px-4 py-2 text-xs text-muted-foreground">
            {searchText ? 'No matches' : 'None yet'}
          </p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onPress(item)}
              className={`w-full mb-0.5 rounded-[14px] px-4 py-3 text-left text-sm transition-colors ${
                activeId === item.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <p className="truncate font-medium">
                {item.title || 'Untitled'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms, currentRoomId, loading, fullName, role, onSelectRoom, onNewChat, onClose,
  notices = [], materials = [], selectedNoticeId = null, selectedMaterialId = null,
  onSelectNotice, onSelectMaterial,
}) => {
  const navigate = useNavigate();
  const { clearAllAuth } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const isCR = role === 'cr';
  const isTeacher = role === 'teacher';
  const hasMultipleSections = isCR || isTeacher;

  const handleLogout = async () => {
    try {
      const endpoints: Record<string, string> = {
        teacher: '/api/v1/teachers/logout',
        cr: '/api/v1/crs/logout',
        student: '/api/v1/students/logout',
      };
      const { default: API } = await import('@/utils/api/apiClient');
      await API.post(endpoints[role] || endpoints.student);
    } catch { }
    clearAllAuth();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (role === 'teacher') return 'Teacher';
    if (role === 'cr') return 'Class Representative';
    return 'Student';
  };

  const filteredRooms = searchText
    ? rooms.filter((r) => r.title?.toLowerCase().includes(searchText.toLowerCase()))
    : rooms;

  return (
    <div className="flex h-full flex-col bg-background border-r border-border">
      {/* Search bar with close icon */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-secondary rounded-[14px] px-4 h-[44px]">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={hasMultipleSections ? 'Search...' : 'Search chats...'}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-4 pb-3">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full rounded-full bg-primary h-[44px] text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 flex flex-col px-3 py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : hasMultipleSections ? (
          <div className="flex flex-col flex-1 min-h-0">
            <SectionList
              title="Your Chats"
              items={filteredRooms.map((r) => ({ id: r.id, title: r.title }))}
              activeId={currentRoomId}
              onPress={(item) => onSelectRoom(item.id)}
              searchText=""
            />
            <div className="mx-4 my-1 border-t border-border shrink-0" />
            <SectionList
              title="Uploaded Notices"
              items={notices}
              activeId={selectedNoticeId}
              onPress={(item) => onSelectNotice?.(item.id)}
              searchText={searchText}
            />
            <div className="mx-4 my-1 border-t border-border shrink-0" />
            <SectionList
              title={isTeacher ? 'Uploaded Marks Sheet' : 'Uploaded Materials'}
              items={materials}
              activeId={selectedMaterialId}
              onPress={(item) => onSelectMaterial?.(item.id, item._materialType || '')}
              searchText={searchText}
            />
          </div>
        ) : (
          /* Student/Teacher: just chats */
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                {searchText ? 'No matching chats' : 'No conversations yet.\nStart a new chat!'}
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full mb-0.5 rounded-[14px] px-4 py-3 text-left text-sm transition-colors ${
                    currentRoomId === room.id
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <p className="truncate font-medium">
                    {room.title || 'New Conversation'}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom profile section */}
      <div className="border-t border-border p-3 relative">
        {userMenuVisible && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuVisible(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-[14px] border border-border bg-popover p-2 animate-fade-in">
              <button
                onClick={() => { setUserMenuVisible(false); navigate('/profile'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => { setUserMenuVisible(false); navigate('/settings'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => { setUserMenuVisible(false); handleLogout(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setUserMenuVisible(!userMenuVisible)}
          className="flex items-center gap-3 w-full rounded-[14px] px-3 py-2.5 hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate">{fullName || 'User'}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{getRoleLabel()}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${userMenuVisible ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
