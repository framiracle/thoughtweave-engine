import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Brain, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Memory {
  id: string;
  title: string;
  emoji: string | null;
  summary: string | null;
  content: string;
  verified: boolean;
  created_at: string;
}

export default function MemoryManager() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoadMemories();
  }, []);

  const checkAdminAndLoadMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleData) {
      setIsAdmin(true);
      loadMemories();
    }
  };

  const loadMemories = async () => {
    const { data, error } = await supabase
      .from('memory_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading memories:", error);
      return;
    }

    setMemories(data || []);
  };

  const addMemory = async () => {
    if (!newTitle || !newContent) {
      toast.error("Please fill in title and content");
      return;
    }

    const { error } = await supabase
      .from('memory_log')
      .insert({
        title: newTitle,
        emoji: newEmoji || "🧠",
        summary: newSummary,
        content: newContent,
        verified: true,
      });

    if (error) {
      toast.error("Failed to add memory");
      console.error(error);
      return;
    }

    toast.success("Memory added successfully");
    setNewTitle("");
    setNewEmoji("");
    setNewSummary("");
    setNewContent("");
    loadMemories();
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('memory_log')
      .update({ verified: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update verification status");
      return;
    }

    toast.success(`Memory ${!currentStatus ? 'verified' : 'unverified'}`);
    loadMemories();
  };

  const deleteMemory = async (id: string) => {
    const { error } = await supabase
      .from('memory_log')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete memory");
      return;
    }

    toast.success("Memory deleted");
    loadMemories();
  };

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Admin access required</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card/50 to-background/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add New Memory</h3>
            <p className="text-sm text-muted-foreground">Store verified knowledge for Carolina</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Memory title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              placeholder="Emoji (optional)"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              maxLength={2}
            />
          </div>
          <Input
            placeholder="Short summary (optional)"
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
          />
          <Textarea
            placeholder="Memory content / knowledge details"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />
          <Button onClick={addMemory} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {memories.map((memory) => (
          <Card key={memory.id} className="p-4 bg-card/50 backdrop-blur">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{memory.emoji || "🧠"}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{memory.title}</h4>
                  {memory.summary && (
                    <p className="text-sm text-muted-foreground">{memory.summary}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={memory.verified ? "default" : "secondary"}>
                  {memory.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{memory.content}</p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(memory.created_at).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleVerification(memory.id, memory.verified)}
                >
                  {memory.verified ? (
                    <><XCircle className="w-4 h-4 mr-1" /> Unverify</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Verify</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMemory(memory.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {memories.length === 0 && (
          <Card className="p-8">
            <p className="text-muted-foreground text-center">No memories stored yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}