import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import NotificationItem, { NotificationItemData } from './NotificationItem';

interface NotificationListProps {
  visible: boolean;
  items: NotificationItemData[];
  loading: boolean;
  emptyText: string;
}

const NotificationList: React.FC<NotificationListProps> = ({ visible, items = [], loading = false, emptyText = 'No notifications.' }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  useEffect(() => {
    if (!visible) return;
    setExpandedId(null);
  }, [visible, safeItems]);

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  if (!visible) return null;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center mt-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center mt-12">
        <p className="text-sm text-muted-foreground text-center px-6">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="pt-2.5 pb-10 overflow-y-auto flex-1 mx-auto w-full lg:w-[80vw]">
      {safeItems.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          expanded={expandedId === item.id}
          onToggle={toggle}
        />
      ))}
    </div>
  );
};

export default NotificationList;
