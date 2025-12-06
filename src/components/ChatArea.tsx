import { useState, useRef, useEffect } from "react";
import { Send, Copy, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "admin" | "carolina";
  text: string;
  emotion?: string;
  sentiment?: string;
  timestamp: Date;
}

const ChatArea = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "admin",
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // First analyze the message
      const { data: analyzeData } = await supabase.functions.invoke('carolina-analyze', {
        body: { message: input }
      });

      // Then get response
      const { data: responseData, error } = await supabase.functions.invoke('carolina-respond', {
        body: { message: input }
      });

      if (error) throw error;

      const carolinaMessage: Message = {
        id: crypto.randomUUID(),
        role: "carolina",
        text: responseData?.response || "I'm processing your request...",
        emotion: analyzeData?.emotion || "neutral",
        sentiment: analyzeData?.sentiment || "neutral",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, carolinaMessage]);

      // Log consciousness
      await supabase.functions.invoke('carolina-consciousness', {
        body: { 
          message: input,
          intent: 'general',
          curiosity_level: 0.5,
          emotional_weight: 0.3
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to get response from Carolina");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  const regenerateResponse = async (originalMessage: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-respond', {
        body: { message: originalMessage }
      });

      if (error) throw error;

      const newMessage: Message = {
        id: crypto.randomUUID(),
        role: "carolina",
        text: data?.response || "Regenerated response...",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      toast.error("Failed to regenerate response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Sparkles className="text-primary" size={20} />
        <h1 className="text-lg font-semibold">Chat with Carolina</h1>
        <span className="text-xs text-muted-foreground ml-auto">v2210</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Sparkles size={48} className="mb-4 text-primary/50" />
            <p className="text-lg">Start a conversation with Carolina</p>
            <p className="text-sm">Your private AI assistant</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "admin" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] p-4 rounded-2xl relative group",
                msg.role === "admin"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border rounded-bl-sm"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {/* Emotion/Sentiment indicator for Carolina messages */}
              {msg.role === "carolina" && msg.emotion && (
                <div className="mt-2 pt-2 border-t border-border/50 flex gap-2 text-xs text-muted-foreground">
                  <span>😊 {msg.emotion}</span>
                  <span>• {msg.sentiment}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className={cn(
                "absolute -bottom-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                msg.role === "admin" ? "right-0" : "left-0"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyMessage(msg.text)}
                >
                  <Copy size={12} />
                </Button>
                {msg.role === "carolina" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const lastAdminMsg = messages.filter(m => m.role === "admin").pop();
                      if (lastAdminMsg) regenerateResponse(lastAdminMsg.text);
                    }}
                  >
                    <RefreshCw size={12} />
                  </Button>
                )}
              </div>
              
              {/* Timestamp */}
              <div className="text-[10px] text-muted-foreground mt-1 opacity-50">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="px-6 rounded-xl"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
