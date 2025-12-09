import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Brain, 
  FlaskConical, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  X
} from "lucide-react";
import { ChatSession } from "@/hooks/useChatSessions";

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, title: string) => void;
}

const ChatSidebar = ({ 
  collapsed, 
  onToggle, 
  onNewChat, 
  sessions,
  currentSessionId, 
  onSelectSession,
  onDeleteSession,
  onRenameSession
}: ChatSidebarProps) => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const menuItems = [
    { icon: Brain, label: "Dashboard", path: "/dashboard" },
    { icon: FlaskConical, label: "Knowledge Lab", path: "/knowledge-lab" },
    { icon: TrendingUp, label: "Trends", path: "/trends" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div 
      className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Carolina</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button 
          onClick={onNewChat}
          className={`w-full gap-2 ${collapsed ? "px-2" : ""}`}
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {!collapsed && <p className="text-xs text-muted-foreground px-2 py-2">Recent Chats</p>}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative flex items-center gap-2 rounded-lg transition-colors ${
                currentSessionId === session.id ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              {editingId === session.id ? (
                <div className="flex items-center gap-1 w-full p-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(session.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(session.id)}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className={`flex-1 justify-start gap-2 text-left h-auto py-2 ${collapsed ? "px-2" : ""}`}
                    onClick={() => onSelectSession?.(session.id)}
                  >
                    <span className="shrink-0">{session.emoji || '💬'}</span>
                    {!collapsed && (
                      <span className="truncate text-sm">{session.title}</span>
                    )}
                  </Button>
                  {!collapsed && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession?.(session.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Navigation Menu */}
      <div className="border-t border-border p-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start gap-2 ${collapsed ? "px-2" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
