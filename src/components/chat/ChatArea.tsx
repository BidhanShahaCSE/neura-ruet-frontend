import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Plus, X, ClipboardCheck, Bell, FileText, BookOpen, BarChart3, Upload, FileSpreadsheet } from 'lucide-react';

interface Message {
  id: string;
  sender_role: string;
  content: string;
  created_at?: string;
}

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  onSendMessage: (content: string, toolName?: string) => void;
  onToolAction?: (toolId: string) => void;
  role: string;
}

const STUDENT_TOOLS: Tool[] = [
  { id: 'check_marks', label: 'Check Marks', icon: <ClipboardCheck className="h-5 w-5" /> },
  { id: 'view_notices', label: 'View Notices', icon: <Bell className="h-5 w-5" /> },
  { id: 'generate_cover_page', label: 'Generate Cover Page', icon: <FileText className="h-5 w-5" /> },
  { id: 'find_materials', label: 'Find Materials', icon: <BookOpen className="h-5 w-5" /> },
];

const TEACHER_TOOLS: Tool[] = [
  { id: 'generate_marksheet', label: 'Generate Marks Sheet', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'find_materials', label: 'Find Materials', icon: <BookOpen className="h-5 w-5" /> },
];

// CR uses the same chat tools as students
const CR_TOOLS: Tool[] = STUDENT_TOOLS;

/* Typewriter effect for the latest AI message */
const Typewriter: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [text]);

  return <RenderTextWithLinks text={displayedText} />;
};

/* Render text with clickable links */
const RenderTextWithLinks: React.FC<{ text: string }> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) =>
        part.match(urlRegex) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline font-bold hover:opacity-80"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

/* Chat loading splash */
const ChatLoadingSplash = () => (
  <div className="flex-1 flex flex-col justify-center px-5 space-y-6">
    <div className="flex justify-end">
      <div className="w-4/5 max-w-xs rounded-[18px] rounded-tr-[4px] bg-primary p-4 space-y-2.5">
        <div className="h-3 rounded-md bg-primary-foreground/15 w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-primary-foreground/15 w-[65%] skeleton-line" />
      </div>
    </div>
    <div className="flex justify-start">
      <div className="w-4/5 max-w-xs rounded-[18px] rounded-tl-[4px] bg-popover p-4 space-y-2.5">
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[65%] skeleton-line" />
      </div>
    </div>
    <div className="flex justify-end">
      <div className="w-4/5 max-w-xs rounded-[18px] rounded-tr-[4px] bg-primary p-4 space-y-2.5">
        <div className="h-3 rounded-md bg-primary-foreground/15 w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-primary-foreground/15 w-[65%] skeleton-line" />
      </div>
    </div>
    <div className="flex justify-start">
      <div className="w-4/5 max-w-xs rounded-[18px] rounded-tl-[4px] bg-popover p-4 space-y-2.5">
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[92%] skeleton-line" />
        <div className="h-3 rounded-md bg-foreground/[0.08] w-[65%] skeleton-line" />
      </div>
    </div>
  </div>
);

const ChatArea: React.FC<ChatAreaProps> = ({ messages, loading, sending, onSendMessage, onToolAction, role }) => {
  const [input, setInput] = useState('');
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toolError, setToolError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showToolSelector = true; // All roles require tool selection
  const tools = role === 'teacher' ? TEACHER_TOOLS : role === 'cr' ? CR_TOOLS : STUDENT_TOOLS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    // Tool validation for all roles
    if (!currentTool) {
      setToolError(true);
      setMenuVisible(true);
      return;
    }

    onSendMessage(input.trim(), currentTool?.id || 'general');
    setInput('');
    setToolError(false);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const selectTool = (tool: Tool) => {
    setCurrentTool(tool);
    setMenuVisible(false);
    setToolError(false);
  };

  const isInputEmpty = !input.trim();

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ChatLoadingSplash />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-6">
            <h3 className="text-xl font-medium text-foreground">
              Hi! RUET intelligence at work...
            </h3>
            {(role === 'cr' || role === 'teacher') && (
              <div className="flex gap-3">
                <button
                  onClick={() => onToolAction?.('upload_notice')}
                  className="flex items-center gap-2.5 rounded-[14px] bg-secondary px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Bell className="h-4.5 w-4.5 text-primary" />
                  Upload Notice
                </button>
                {role === 'cr' ? (
                  <button
                    onClick={() => onToolAction?.('upload_material')}
                    className="flex items-center gap-2.5 rounded-[14px] bg-secondary px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Upload className="h-4.5 w-4.5 text-primary" />
                    Upload Material
                  </button>
                ) : (
                  <button
                    onClick={() => onToolAction?.('create_result')}
                    className="flex items-center gap-2.5 rounded-[14px] bg-secondary px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
                    Result Create
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 space-y-3 max-w-3xl mx-auto w-full">
            {messages.map((msg, idx) => {
              const isUser = msg.sender_role === 'user' || msg.sender_role === 'student' || msg.sender_role === 'teacher' || msg.sender_role === 'cr';
              const isLastAssistant = !isUser && idx === messages.length - 1;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[68%] rounded-[12px] px-4 py-2.5 ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-[8px]'
                        : 'bg-popover rounded-tl-[8px]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-foreground/10">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[8px] font-bold text-primary-foreground">AI</span>
                        </div>
                        <span className="text-[11px] font-semibold text-primary">Neura AI</span>
                      </div>
                    )}
                    <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${
                      isUser ? 'text-primary-foreground' : 'text-foreground/[0.88]'
                    }`}>
                      {!isUser && isLastAssistant ? (
                        <Typewriter text={msg.content} />
                      ) : (
                        <RenderTextWithLinks text={msg.content} />
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-[12px] rounded-tl-[8px] bg-popover px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="relative px-3 pb-4 pt-2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35), #000000)' }}>
        <div className="max-w-3xl mx-auto w-full">
        {/* Tool pill */}
        {currentTool && (
          <div className="mb-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/30 px-3 py-1.5">
              <span className="text-foreground">{currentTool.icon}</span>
              <span className="text-xs font-medium text-foreground">{currentTool.label}</span>
              <button onClick={() => setCurrentTool(null)} className="ml-1 text-foreground/60 hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Plus button - tool selector */}
          {showToolSelector && (
            <div className="relative">
              {menuVisible && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuVisible(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-[14px] border border-border bg-popover p-2.5">
                    {toolError && (
                      <p className="text-xs text-destructive text-center mb-2 mt-1">Please select a tool</p>
                    )}
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => selectTool(tool)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-foreground hover:bg-secondary transition-colors"
                      >
                        <span className="text-foreground">{tool.icon}</span>
                        <span className="text-sm font-medium">{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuVisible(!menuVisible);
                  setToolError(false);
                }}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-secondary"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Input wrapper */}
          <div className="flex-1 flex items-end bg-secondary rounded-full pl-4 pr-1.5 py-1 min-h-[44px] max-h-[110px]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Write here..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none py-2 mr-2"
              style={{ maxHeight: '96px' }}
            />
            <button
              type="submit"
              disabled={isInputEmpty || sending}
               className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-all mb-0 ${
                 isInputEmpty || sending
                   ? 'bg-border'
                   : 'bg-primary'
               }`}
             >
               <Send className={`h-4 w-4 ml-0.5 ${
                 isInputEmpty || sending ? 'text-muted-foreground' : 'text-primary-foreground'
               }`} />
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
