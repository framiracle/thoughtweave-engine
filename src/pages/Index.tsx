import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ChatSidebar from "@/components/ChatSidebar";
import ChatPanel from "@/components/ChatPanel";
import StatusSidebar from "@/components/StatusSidebar";
import { useChatSessions } from "@/hooks/useChatSessions";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const {
    sessions,
    currentSessionId,
    messages,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
    addMessage,
    selectSession,
  } = useChatSessions();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await checkAdminStatus(session.user.id);
    }
    setAuthLoading(false);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleNewChat = async () => {
    await createSession();
  };

  const handleRenameSession = async (sessionId: string, title: string) => {
    await updateSession(sessionId, title);
  };

  const handleUpdateSessionTitle = async (title: string, emoji: string) => {
    if (currentSessionId) {
      await updateSession(currentSessionId, title, emoji);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Carolina Olivia
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your empathetic AI companion with expertise in programming, ethical hacking, 
            emotions, literature, culture, and more
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="px-8">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <ChatSidebar
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(!leftCollapsed)}
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* Main Chat Area */}
      <ChatPanel
        messages={messages}
        loading={sessionsLoading}
        sessionId={currentSessionId}
        onAddMessage={addMessage}
        onUpdateSessionTitle={handleUpdateSessionTitle}
      />

      {/* Right Sidebar - AI Status */}
      <StatusSidebar
        collapsed={rightCollapsed}
        onToggle={() => setRightCollapsed(!rightCollapsed)}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Index;
