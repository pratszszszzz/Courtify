import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock legal responses for demonstration
  const getLegalResponse = async (userMessage: string): Promise<{ content: string; reference?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('fundamental right') || lowerMessage.includes('article 14') || lowerMessage.includes('equality')) {
      return {
        content: 'Article 14 of the Indian Constitution guarantees the Right to Equality. It states that "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India." This means all citizens are equal before law regardless of their religion, race, caste, sex, or place of birth. This fundamental right ensures equal treatment and prevents discrimination by the State.',
        reference: 'Article 14 - Right to Equality'
      };
    }
    
    if (lowerMessage.includes('free speech') || lowerMessage.includes('article 19') || lowerMessage.includes('expression')) {
      return {
        content: 'Article 19(1)(a) of the Indian Constitution guarantees freedom of speech and expression to all citizens. However, this right is subject to reasonable restrictions under Article 19(2) in the interests of sovereignty, integrity, security of State, friendly relations with foreign States, public order, decency, morality, contempt of court, defamation, or incitement to offence. The Supreme Court has held this to be one of the most important fundamental rights in a democracy.',
        reference: 'Article 19 - Freedom of Speech and Expression'
      };
    }
    
    if (lowerMessage.includes('directive principle') || lowerMessage.includes('article 38') || lowerMessage.includes('welfare')) {
      return {
        content: 'Article 38 is a Directive Principle of State Policy that directs the State to promote the welfare of people by securing a social order in which justice - social, economic and political - informs all institutions of national life. While not enforceable in courts, these principles are fundamental in governance and it is the duty of the State to apply these principles in making laws.',
        reference: 'Article 38 - Directive Principles of State Policy'
      };
    }
    
    if (lowerMessage.includes('preamble') || lowerMessage.includes('constitution purpose')) {
      return {
        content: 'The Preamble to the Indian Constitution declares India to be a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC. It secures JUSTICE (social, economic, political), LIBERTY (of thought, expression, belief, faith, worship), EQUALITY (of status and opportunity), and FRATERNITY (assuring dignity of individual and unity of nation). The Preamble reflects the philosophy and fundamental values upon which the Constitution is based.',
        reference: 'Preamble - Constitution of India'
      };
    }
    
    return {
      content: 'I understand you have a question about Indian law. While I can provide general constitutional guidance, for specific legal matters I recommend consulting with a qualified lawyer. I can help explain constitutional provisions, fundamental rights, directive principles, and general legal concepts. Could you please specify which aspect of Indian constitutional law you\'d like to know about?',
      reference: 'General Legal Guidance'
    };
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
        content: response.content,
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

  useEffect(() => {
    scrollAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <div ref={scrollAreaRef} />
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