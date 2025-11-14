import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatInterface } from "@/components/ChatInterface";
import { MemoryPanel } from "@/components/MemoryPanel";
import { DomainWeights } from "@/components/DomainWeights";
import { ReasoningProcess } from "@/components/ReasoningProcess";
import { ActionButtons } from "@/components/ActionButtons";
import { Brain, LogOut, Shield, Settings, Home, Battery, BookOpen, FlaskConical, Menu, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="text-center">
          <Brain className="w-24 h-24 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Carolina Olivia
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Your empathetic AI companion with expertise in programming, ethical hacking, 
            emotions, literature, culture, and more
          </p>
          <Button onClick={() => navigate("/auth")} size="lg">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
                <Home className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Carolina Olivia 💠</h1>
                <p className="text-sm text-muted-foreground">Empathetic AI Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate("/settings")} variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              {isAdmin && (
                <Button onClick={() => navigate("/admin")} variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Side Menu */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-lg">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="space-y-4 pt-8">
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/dashboard")}>
                <Brain className="w-5 h-5" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/unicorn")}>
                <FlaskConical className="w-5 h-5" />
                Unicorn AI Hub
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/knowledge-lab")}>
                <BookOpen className="w-5 h-5" />
                Knowledge Lab
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/trends")}>
                <TrendingUp className="w-5 h-5" />
                Trends & Predictions
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/dashboard")}>
                <Battery className="w-5 h-5" />
                Brain Status
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-2 h-[calc(100vh-180px)]">
            <ChatInterface />
          </div>

          {/* Right Column - Analysis Panels */}
          <div className="space-y-6">
            <DomainWeights />
            <ReasoningProcess />
            <MemoryPanel />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          <ActionButtons />
        </div>
      </main>
    </div>
  );
};

export default Index;
