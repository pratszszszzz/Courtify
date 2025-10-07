import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { chat } from "@/lib/api";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  constitutional_reference?: string;
}

const LegalChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Namaste! I am your AI Legal Assistant specializing in Indian Constitutional Law. I can help you understand constitutional provisions, fundamental rights, directive principles, and legal procedures. How may I assist you today?',
      timestamp: new Date(),
      constitutional_reference: 'General Constitutional Guidance'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sanitizeContent = (text: string) => {
    // Remove markdown bold markers and trim excessive whitespace
    return text.replace(/\*\*/g, "").replace(/\s+$/g, "");
  };

  // Calls backend /chat with fallback inside api.ts
  const getLegalResponse = async (userMessage: string): Promise<{ content: string; reference?: string }> => {
    const result = await chat(userMessage);
    return { content: result.content, reference: result.reference };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getLegalResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: sanitizeContent(response.content || ''),
        timestamp: new Date(),
        constitutional_reference: response.reference
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting legal response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again or consult with a qualified legal professional for immediate assistance.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Note: We intentionally avoid auto-scrolling the page on new messages to
  // prevent the entire homepage from jumping. The chat area remains scrollable.

  return (
    <section id="chat-section" className="py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            Constitutional Legal Assistant
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask questions about Indian Constitutional Law, fundamental rights, and legal provisions
          </p>
        </div>

        <Card className="max-w-4xl mx-auto legal-shadow">
          {/* Chat Header */}
          <div className="border-b bg-primary text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Legal Assistant</h3>
                <p className="text-sm opacity-90">Constitutional Law Specialist</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start space-x-3 max-w-[80%]",
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      )}
                    >
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 space-y-2",
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.constitutional_reference && (
                        <div className="text-xs opacity-75 font-medium">
                          📖 {message.constitutional_reference}
                        </div>
                      )}
                      <div className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* sentinel removed to prevent page scroll jumps */}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about constitutional law, fundamental rights, legal procedures..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary-light"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ⚖️ This AI provides general legal information. For specific legal matters, consult a qualified attorney.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default LegalChat;