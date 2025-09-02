import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, FileText, MessageCircle, Shield } from "lucide-react";

const LegalHero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 hero-gradient"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Scale size={120} className="text-white" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <Shield size={100} className="text-white" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 fade-in-up">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight">
              Indian AI Legal
              <span className="block bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Assistant
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your intelligent guide to Indian Constitutional Law, legal document analysis, 
              and professional legal assistance powered by AI
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="glass-effect p-6 border-white/20 hover:border-accent/50 transition-all duration-300 scale-in">
              <MessageCircle className="w-12 h-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Constitutional Q&A</h3>
              <p className="text-white/80 text-sm">
                Get instant answers about Indian Constitution articles, fundamental rights, and legal provisions
              </p>
            </Card>

            <Card className="glass-effect p-6 border-white/20 hover:border-accent/50 transition-all duration-300 scale-in" style={{animationDelay: '0.2s'}}>
              <FileText className="w-12 h-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Document Analysis</h3>
              <p className="text-white/80 text-sm">
                Upload legal documents for AI-powered summarization and plain English explanations
              </p>
            </Card>

            <Card className="glass-effect p-6 border-white/20 hover:border-accent/50 transition-all duration-300 scale-in" style={{animationDelay: '0.4s'}}>
              <Scale className="w-12 h-12 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Legal Guidance</h3>
              <p className="text-white/80 text-sm">
                Professional legal insights based on Indian law and constitutional framework
              </p>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-accent hover:bg-accent-light text-primary font-semibold px-8 py-4 text-lg"
              onClick={() => scrollToSection('chat-section')}
            >
              Start Legal Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4 text-lg"
              onClick={() => scrollToSection('constitution-section')}
            >
              Browse Constitution
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm mb-4">Trusted Legal AI Assistant</p>
            <div className="flex justify-center space-x-8 text-white/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">500+</div>
                <div className="text-xs">Constitutional Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">24/7</div>
                <div className="text-xs">AI Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">100%</div>
                <div className="text-xs">Confidential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegalHero;