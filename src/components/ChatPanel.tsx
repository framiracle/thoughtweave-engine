import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Copy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  onNewMessage?: () => void;
}

const ChatPanel = ({ onNewMessage }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (data && data.length > 0) {
      const history = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      setMessages(history);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('cothink-chat', {
        body: { 
          message: userMessage.content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (error) throw error;

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages(prev => [...prev, aiMessage]);
      onNewMessage?.();
    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error("Failed to get response. Please try again.");
      setMessages(prev => prev.slice(0, -1));
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Carolina Olivia</h2>
            <p className="text-xs text-muted-foreground">AI Companion • Online</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Hello! I'm Carolina</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your empathetic AI companion with expertise in programming, ethical hacking, 
                emotions, literature, culture, and more. How can I help you today?
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className="group">
              <div className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user" 
                    ? "bg-secondary" 
                    : "bg-primary/20"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block max-w-[85%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card text-foreground rounded-tl-sm border border-border"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === "user" ? "text-right" : ""
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.content)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden focus-within:border-primary/50 transition-colors">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Carolina..."
              className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent pr-12 focus-visible:ring-0"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 rounded-xl h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Carolina can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
