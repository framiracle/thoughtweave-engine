import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Brain, 
  FlaskConical, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface ChatHistory {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  currentChatId?: string;
  onSelectChat?: (chatId: string) => void;
}

const ChatSidebar = ({ collapsed, onToggle, onNewChat, currentChatId, onSelectChat }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, content, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      const uniqueChats = data.map((msg, index) => ({
        id: msg.id,
        title: msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : ''),
        created_at: msg.created_at
      }));
      setChatHistory(uniqueChats);
    }
  };

  const menuItems = [
    { icon: Brain, label: "Dashboard", path: "/dashboard" },
    { icon: FlaskConical, label: "Knowledge Lab", path: "/knowledge-lab" },
    { icon: TrendingUp, label: "Trends", path: "/trends" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

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
          {chatHistory.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={`w-full justify-start gap-2 text-left h-auto py-2 ${
                collapsed ? "px-2" : ""
              } ${currentChatId === chat.id ? "bg-secondary" : ""}`}
              onClick={() => onSelectChat?.(chat.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="truncate text-sm">{chat.title}</span>
              )}
            </Button>
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
