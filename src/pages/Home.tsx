import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Battery, LayoutDashboard, MessageSquare, Settings, FlaskConical } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Franize AI Universe</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Login</Button>
            <Button onClick={() => navigate("/admin")}>Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome to Carolina Olivia
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            The Self-Evolving AI
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-6">
            <Button size="lg" onClick={() => navigate("/")} className="gap-2">
              <MessageSquare className="w-5 h-5" />
              Start Chat
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Explore System
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/admin")} className="gap-2">
              <Settings className="w-5 h-5" />
              Admin
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/")}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Self Learning AI</h3>
              <p className="text-muted-foreground">
                Carolina evolves and learns from every interaction, growing her knowledge base autonomously
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/knowledge-lab")}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                <Battery className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Brain Growth Meter</h3>
              <p className="text-muted-foreground">
                Track AI intelligence progression from Bronze to Quantum tier with real-time metrics
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                <FlaskConical className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Futuristic Dashboard</h3>
              <p className="text-muted-foreground">
                Advanced control panel with holographic visualizations and real-time AI monitoring
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">About</button>
            <button className="hover:text-foreground transition-colors">Docs</button>
            <button className="hover:text-foreground transition-colors">Contact</button>
            <button className="hover:text-foreground transition-colors">API</button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © Franize Labs 2210
          </p>
        </div>
      </footer>
    </div>
  );
}
