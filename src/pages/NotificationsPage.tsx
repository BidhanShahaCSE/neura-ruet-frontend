import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listCrNoticeFeed, listStudentNoticesFeed } from '@/services/noticeService';
import NotificationList from '@/components/notifications/NotificationList';
import type { NotificationItemData } from '@/components/notifications/NotificationItem';

function parseBackendDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;

  let iso = value.trim();
  if (!iso) return null;

  if (/^\d{4}-\d{2}-\d{2} /.test(iso)) iso = iso.replace(' ', 'T');

  const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(iso);
  if (!hasTimezone) iso = `${iso}Z`;

  const dt = new Date(iso);
  const ts = dt.getTime();
  if (!Number.isFinite(ts)) return null;
  return dt;
}

function toRelativeTime(value: unknown): string {
  try {
    const dt = parseBackendDate(value);
    const ts = dt?.getTime();
    if (!Number.isFinite(ts)) return '';

    const ms = Date.now() - ts!;
    if (!Number.isFinite(ms) || ms < 0) return 'just now';
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day === 1 ? '' : 's'} ago`;
  } catch {
    return '';
  }
}

function mapNoticesToItems(notices: any[]): NotificationItemData[] {
  if (!Array.isArray(notices)) return [];
  return notices
    .map((n) => {
      const createdByRole = String(n?.created_by_role ?? '').toLowerCase();
      const sender = createdByRole === 'teacher' ? 'Teacher' : createdByRole === 'cr' ? 'CR' : 'Notice';
      const initial = sender ? sender[0] : 'N';
      const timeSource = n?.updated_at || n?.created_at;

      return {
        id: String(n?.id ?? ''),
        sender,
        title: n?.title ?? 'Untitled',
        description: n?.notice_message ?? '',
        time: toRelativeTime(timeSource),
        initial,
        color: '#5C8D34',
      };
    })
    .filter((x) => x.id);
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [items, setItems] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let notices: any[] = [];
      if (role === 'cr') {
        notices = await listCrNoticeFeed({ skip: 0, limit: 50 });
      } else if (role === 'student') {
        notices = await listStudentNoticesFeed({ skip: 0, limit: 50 });
      }
      setItems(mapNoticesToItems(notices));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const emptyText = useMemo(() => {
    if (role === 'cr') return 'No notices for your class yet.';
    if (role === 'student') return 'No notices for your class yet.';
    return 'No notifications.';
  }, [role]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full mr-2.5 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-2xl font-medium text-primary">Notifications</h1>
      </div>

      {/* List Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <NotificationList visible={true} items={items} loading={loading} emptyText={emptyText} />
      </div>
    </div>
  );
};

export default NotificationsPage;
