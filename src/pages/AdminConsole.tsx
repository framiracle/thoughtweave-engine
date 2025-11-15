import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminConsole = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState("dark");
  const [settings, setSettings] = useState({
    chat_style: "empathetic",
    theme: "dark",
    memory_retention: 80,
    learning_speed: 5,
    max_topics: 50,
    auto_suggest_topics: true,
    enable_predictive_ai: true,
    enable_labs: false,
  });
  const [knowledge, setKnowledge] = useState<Array<{ category: string; value: number }>>([]);
  const [learning, setLearning] = useState<Array<{ topic: string; mastery: number }>>([]);
  const [chats, setChats] = useState<Array<any>>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [chatTitle, setChatTitle] = useState("");
  const [chatBody, setChatBody] = useState("");

  useEffect(() => {
    loadSettings();
    loadKnowledge();
    loadLearning();
    loadChats();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase.functions.invoke("admin-get-settings");
    if (!error && data) {
      setSettings(data);
      setTheme(data.theme || "dark");
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase.functions.invoke("admin-save-settings", {
      body: settings,
    });
    if (!error) {
      toast({ title: "Settings saved successfully" });
    } else {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  };

  const loadKnowledge = async () => {
    const { data, error } = await supabase.functions.invoke("admin-get-knowledge");
    if (!error && data) {
      setKnowledge(data);
    }
  };

  const saveKnowledge = async () => {
    const { error } = await supabase.functions.invoke("admin-save-knowledge", {
      body: knowledge,
    });
    if (!error) {
      toast({ title: "Knowledge battery updated" });
    }
  };

  const loadLearning = async () => {
    const { data, error } = await supabase.functions.invoke("admin-get-learning");
    if (!error && data) {
      setLearning(data);
    }
  };

  const saveLearning = async () => {
    const { error } = await supabase.functions.invoke("admin-save-learning", {
      body: learning,
    });
    if (!error) {
      toast({ title: "Self-learning updated" });
    }
  };

  const loadChats = async () => {
    const { data, error } = await supabase.functions.invoke("admin-get-chats");
    if (!error && data) {
      setChats(data);
    }
  };

  const createNewChat = async () => {
    const body = prompt("Quick summary or topic for this chat (1-20 words):") || "General";
    const summary = body.split(/\s+/).slice(0, 4).join(" ");
    const title = `📝 ${summary}`;
    
    const { data, error } = await supabase.functions.invoke("admin-create-chat", {
      body: { title, summary },
    });
    
    if (!error) {
      toast({ title: "Chat created" });
      loadChats();
    }
  };

  const openChat = (chat: any) => {
    setCurrentChat(chat);
    setChatTitle(chat.title);
    setChatBody(`Opened chat: ${chat.summary}\n\n(You can paste / write notes here)`);
  };

  const applyTheme = (newTheme: string) => {
    setTheme(newTheme);
    setSettings({ ...settings, theme: newTheme });
    if (newTheme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen gap-4 p-5">
        {/* Sidebar */}
        <aside className="w-80 bg-card rounded-xl p-4 shadow-lg overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Carolina Olivia — Admin</h2>
              <div className="text-xs text-muted-foreground">Private AI · Admin: <strong>Franize</strong></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Settings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => applyTheme(e.target.value)}
                  className="w-full p-2 rounded bg-secondary/10 text-sm"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Chat style</label>
                <select
                  value={settings.chat_style}
                  onChange={(e) => setSettings({ ...settings, chat_style: e.target.value })}
                  className="w-full p-2 rounded bg-secondary/10 text-sm"
                >
                  <option>empathetic</option>
                  <option>formal</option>
                  <option>casual</option>
                  <option>poetic</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSettings} size="sm" className="flex-1">Save Settings</Button>
                <Button onClick={loadSettings} size="sm" variant="outline" className="flex-1">Reload</Button>
              </div>
            </div>
          </div>

          {/* Knowledge Battery */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Knowledge Battery</h3>
            <div className="space-y-2">
              {knowledge.map((item, idx) => (
                <div key={idx} className="p-2 bg-secondary/10 rounded">
                  <div className="font-medium text-sm">{item.category}</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.value}
                    onChange={(e) => {
                      const newKnowledge = [...knowledge];
                      newKnowledge[idx].value = parseInt(e.target.value);
                      setKnowledge(newKnowledge);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  const cat = prompt("New category name:");
                  if (cat) setKnowledge([...knowledge, { category: cat, value: 10 }]);
                }}>+ Add</Button>
                <Button size="sm" variant="outline" onClick={saveKnowledge}>Save</Button>
              </div>
            </div>
          </div>

          {/* Self-Learning Growth */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Self-Learning Growth</h3>
            <div className="space-y-2">
              {learning.map((item, idx) => (
                <div key={idx} className="p-2 bg-secondary/10 rounded">
                  <div className="font-medium text-sm">{item.topic}</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.mastery}
                    onChange={(e) => {
                      const newLearning = [...learning];
                      newLearning[idx].mastery = parseInt(e.target.value);
                      setLearning(newLearning);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  const topic = prompt("New learning topic:");
                  if (topic) setLearning([...learning, { topic, mastery: 10 }]);
                }}>+ Add</Button>
                <Button size="sm" variant="outline" onClick={saveLearning}>Save</Button>
              </div>
            </div>
          </div>

          {/* Chats */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Chats</h3>
            <div className="flex gap-2 mb-3">
              <Button size="sm" onClick={createNewChat}>+ New Chat</Button>
              <Button size="sm" variant="outline" onClick={loadChats}>Refresh</Button>
            </div>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="p-2 bg-secondary/10 rounded cursor-pointer hover:bg-secondary/20" onClick={() => openChat(chat)}>
                  <div className="font-medium text-sm">{chat.title}</div>
                  <div className="text-xs text-muted-foreground">{chat.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 bg-gradient-to-b from-secondary/5 to-transparent rounded-xl p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Workspace</h2>
          <div className="text-sm text-muted-foreground mb-4">
            Click a chat to open/edit. Auto-title uses emoji + 1–4 word summary.
          </div>

          {currentChat ? (
            <div className="space-y-4">
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Title (auto-generated)"
                className="w-full p-3 rounded bg-card"
              />
              <textarea
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                rows={12}
                className="w-full p-3 rounded bg-card resize-none"
              />
              <Button onClick={() => toast({ title: "Chat saved" })}>Save Chat</Button>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
              Click a chat to open
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminConsole;
