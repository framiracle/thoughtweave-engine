import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'dark',
    chatStyle: 'empathetic',
    memoryRetention: 80,
    learningSpeed: 5,
    maxTopics: 50,
    autoSuggest: true,
    predictiveAI: true,
    enableLabs: false,
    voiceAlerts: false,
    autoBackup: true,
    emotionalSensitivity: 7,
    developerMode: false
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Account & Profile */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h3 className="text-lg font-bold text-foreground mb-4">Account & Profile</h3>
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input defaultValue="Franize" />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue="miraclefranize3@gmail.com" disabled />
              </div>
            </div>
          </Card>

          {/* Themes & Appearance */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h3 className="text-lg font-bold text-foreground mb-4">Themes & Appearance</h3>
            <div className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(v) => setSettings({...settings, theme: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Futuristic Dark</SelectItem>
                    <SelectItem value="light">Classic Light</SelectItem>
                    <SelectItem value="neon">Neon Cyber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* AI Behavior */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h3 className="text-lg font-bold text-foreground mb-4">AI Behavior Customization</h3>
            <div className="space-y-4">
              <div>
                <Label>Chat Style</Label>
                <Select value={settings.chatStyle} onValueChange={(v) => setSettings({...settings, chatStyle: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="poetic">Poetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Memory Retention (%): {settings.memoryRetention}</Label>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.memoryRetention}
                  onChange={(e) => setSettings({...settings, memoryRetention: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Learning Speed (1-10): {settings.learningSpeed}</Label>
                <Input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={settings.learningSpeed}
                  onChange={(e) => setSettings({...settings, learningSpeed: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Emotional Sensitivity (1-10): {settings.emotionalSensitivity}</Label>
                <Input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={settings.emotionalSensitivity}
                  onChange={(e) => setSettings({...settings, emotionalSensitivity: Number(e.target.value)})}
                />
              </div>
            </div>
          </Card>

          {/* Features */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h3 className="text-lg font-bold text-foreground mb-4">Features & Capabilities</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-Suggest Topics</Label>
                <Switch checked={settings.autoSuggest} onCheckedChange={(v) => setSettings({...settings, autoSuggest: v})} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Predictive AI</Label>
                <Switch checked={settings.predictiveAI} onCheckedChange={(v) => setSettings({...settings, predictiveAI: v})} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Enable Labs</Label>
                <Switch checked={settings.enableLabs} onCheckedChange={(v) => setSettings({...settings, enableLabs: v})} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Voice Alerts</Label>
                <Switch checked={settings.voiceAlerts} onCheckedChange={(v) => setSettings({...settings, voiceAlerts: v})} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Auto Backup</Label>
                <Switch checked={settings.autoBackup} onCheckedChange={(v) => setSettings({...settings, autoBackup: v})} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Developer Mode (Franize only)</Label>
                <Switch checked={settings.developerMode} onCheckedChange={(v) => setSettings({...settings, developerMode: v})} />
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 bg-card/50 backdrop-blur border-destructive/50">
            <h3 className="text-lg font-bold text-destructive mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <Button variant="destructive" className="w-full">Reset to Factory Settings</Button>
              <Button variant="outline" className="w-full">Reboot AI System</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
