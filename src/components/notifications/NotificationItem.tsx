import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface NotificationItemData {
  id: string;
  sender: string;
  title: string;
  description: string;
  time: string;
  initial: string;
  color: string;
}

interface NotificationItemProps {
  item: NotificationItemData;
  expanded: boolean;
  onToggle: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, expanded, onToggle }) => {
  return (
    <div className="mb-5 px-5">
      {/* Clickable Header Row */}
      <button
        onClick={() => onToggle(item.id)}
        className="flex w-full items-start text-left"
      >
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full mr-3.5 mt-0.5"
          style={{ backgroundColor: item.color }}
        >
          <span className="text-base font-medium text-primary">{item.initial}</span>
        </div>

        {/* Middle Text */}
        <div className="flex-1 mr-2 min-w-0">
          <p className="text-xs text-foreground/90">{item.sender}</p>
          <p className="text-base font-medium text-foreground leading-snug">{item.title}</p>
        </div>

        {/* Right Side (Time + Arrow) */}
        <div className="flex flex-col items-end justify-between h-10 shrink-0">
          <span className="text-[11px] text-muted-foreground mb-1">{item.time}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-foreground transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded Description */}
      {expanded && (
        <div className="pl-[54px] mt-2.5">
          <div className="rounded-xl bg-secondary border border-border p-3.5">
            <p className="text-xs text-muted-foreground leading-[18px]">{item.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
