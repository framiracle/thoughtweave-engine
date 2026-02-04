import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage } from "@/hooks/useChatSessions";
import { useCore } from "@/core/CoreContext";

interface ChatPanelProps {
  messages: ChatMessage[];
  loading?: boolean;
  sessionId: string | null;
  onAddMessage: (role: string, content: string) => Promise<any>;
  onUpdateSessionTitle?: (title: string, emoji: string) => void;
}

const ChatPanel = ({ messages, loading, sessionId, onAddMessage, onUpdateSessionTitle }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoTitled = useRef(false);
  const { updateMemory, updateEmotion, snapshotEmotions, memory, emotionalState, version, schemaVersion } = useCore();

  useEffect(() => {
    hasAutoTitled.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Detect emotion from user text (silent, non-verbal)
  const detectEmotion = (text: string) => {
    const lowerText = text.toLowerCase();
    if (/\b(thank|thanks|grateful|appreciate)\b/.test(lowerText)) updateEmotion("trust", 1);
    if (/\b(love|heart|care)\b/.test(lowerText)) updateEmotion("love", 1);
    if (/\b(happy|joy|great|awesome|excited)\b/.test(lowerText)) updateEmotion("joy", 1);
    if (/\b(sad|down|depressed|lonely)\b/.test(lowerText)) updateEmotion("sadness", 1);
    if (/\b(angry|mad|frustrated|annoyed)\b/.test(lowerText)) updateEmotion("frustration", 1);
    if (/\b(help|confused|lost|question)\b/.test(lowerText)) updateEmotion("seeking", 1);
    if (/\b(worry|anxious|stress|nervous)\b/.test(lowerText)) updateEmotion("anxiety", 1);
    if (/\b(curious|wonder|interesting)\b/.test(lowerText)) updateEmotion("curiosity", 1);
    if (/\b(hope|hopeful|optimistic)\b/.test(lowerText)) updateEmotion("hope", 1);
    if (/\b(calm|peace|relax)\b/.test(lowerText)) updateEmotion("calm", 1);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      await onAddMessage("user", userMessage);

      // Update core memory with conversation context
      updateMemory("last_user_message", userMessage);
      updateMemory("last_interaction_at", Date.now());
      updateMemory("conversation_count", (memory.conversation_count ?? 0) + 1);
      
      // Silent emotion detection
      detectEmotion(userMessage);

      if (messages.length === 0 && !hasAutoTitled.current && onUpdateSessionTitle) {
        hasAutoTitled.current = true;
        const words = userMessage.split(/\s+/).slice(0, 4).join(' ');
        const text = userMessage.toLowerCase();
        let emoji = '✨';
        if (/\b(love|heart)\b/.test(text)) emoji = '❤️';
        else if (/\b(happy|joy|great)\b/.test(text)) emoji = '😊';
        else if (/\b(code|program|bug)\b/.test(text)) emoji = '💻';
        else if (/\b(help|question)\b/.test(text)) emoji = '❓';
        onUpdateSessionTitle(words.length > 30 ? words.slice(0, 30) + '...' : words, emoji);
      }

      // Build core context to send to edge function
      const coreContext = {
        version,
        schemaVersion,
        memory: {
          conversation_count: memory.conversation_count ?? 0,
          last_interaction_at: memory.last_interaction_at,
        },
        emotionalState,
      };

      const { data, error } = await supabase.functions.invoke('cothink-chat', {
        body: { 
          message: userMessage, 
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          coreContext 
        }
      });

      if (error) throw error;
      
      const responseText = data.response || "I'm thinking...";
      await onAddMessage("assistant", responseText);
      
      // Store last response in core memory
      updateMemory("last_response", responseText);
      
      // Snapshot emotional state after meaningful interaction
      if (messages.length > 0 && messages.length % 5 === 0) {
        snapshotEmotions();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a chat or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="border-b border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Carolina Olivia</h2>
          <p className="text-xs text-muted-foreground">AI Companion • Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Hello! I'm Carolina</h3>
              <p className="text-muted-foreground max-w-md mx-auto">How can I help you today?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-secondary" : "bg-primary/20"}`}>
                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block max-w-[85%] p-4 rounded-2xl ${message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card text-foreground rounded-tl-sm border border-border"}`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === "user" ? "text-right" : ""}`}>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content)} className="h-7 text-xs"><Copy className="w-3 h-3 mr-1" />Copy</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-4 h-4 text-primary animate-pulse" /></div>
              <div className="bg-card border border-border rounded-2xl p-4"><div className="flex gap-1"><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" /><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto relative bg-card border border-border rounded-2xl overflow-hidden">
          <Textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message Carolina..." className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent pr-12 focus-visible:ring-0" disabled={isLoading} rows={1} />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="absolute right-2 bottom-2 rounded-xl h-9 w-9"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
