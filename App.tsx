
import React, { useState, useRef } from 'react';
import { ShieldCheck, MessageCircle, BarChart3, Upload, Loader2, Lock, ChevronDown, ChevronUp, Info, HelpCircle, Github, Instagram, Phone } from 'lucide-react';
import JSZip from 'jszip';
import { parseWhatsAppChat, calculateStats } from './services/chatParser';
import { getAiInsights } from './services/geminiService';
import { ChatStats, AiInsights } from './types';
import { StoryView } from './components/StoryView';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    {/* Circular Arrow */}
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-12">
      <path 
        d="M 15 65 A 40 40 0 1 1 85 45" 
        fill="none" 
        stroke="#1C354D" 
        strokeWidth="8" 
        strokeLinecap="round"
        className="drop-shadow-sm"
      />
      <path 
        d="M 85 45 L 75 38 M 85 45 L 90 55" 
        fill="none" 
        stroke="#1C354D" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
    </svg>
    {/* WhatsApp Bubble */}
    <div className="relative z-10 w-[60%] h-[60%] bg-[#4CAF50] rounded-full flex items-center justify-center shadow-lg">
      <Phone className="w-[60%] h-[60%] text-white fill-current" />
      <div className="absolute -bottom-1 -left-1 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-[#4CAF50] rotate-[15deg]"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [showStory, setShowStory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      let text = '';
      
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        const chatFileName = Object.keys(contents.files).find(
          name => name.endsWith('.txt') && !name.startsWith('__MACOSX')
        );

        if (!chatFileName) {
          throw new Error("No text file found inside the zip archive.");
        }

        text = await contents.files[chatFileName].async('string');
      } else {
        text = await file.text();
      }

      const messages = parseWhatsAppChat(text);
      
      if (messages.length === 0) {
        alert("We couldn't find any messages in this file. Please make sure it's a valid chat export.");
        setIsAnalyzing(false);
        return;
      }

      const chatStats = calculateStats(messages);
      const sampleText = messages.slice(0, 50).map(m => m.content).join("\n");
      const insights = await getAiInsights(chatStats, sampleText);

      setStats(chatStats);
      setAiInsights(insights);
      setShowStory(true);
    } catch (error) {
      console.error("Analysis Error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen wrapped-gradient flex flex-col items-center selection:bg-white selection:text-black scroll-smooth">
      
      {/* Background Decor - Forest Theme */}
      <div className="fixed top-[5%] right-[-5%] w-[600px] h-[600px] bg-[#4CAF50]/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[#128C7E]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      {!showStory && (
        <nav className="sticky top-0 w-full z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="font-bold tracking-tighter text-2xl hidden sm:inline">WhatsWrapped</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Ayan-Script" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              title="GitHub"
            >
              <Github className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </a>
            <a 
              href="http://instagram.com/the_ayaan.vrs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              title="Instagram"
            >
              <Instagram className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </a>
          </div>
        </nav>
      )}

      {/* Main UI - Single Screen Layout */}
      {!showStory && (
        <main className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8 px-6">
          <div className="w-full text-center space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase mb-2">
                <Lock className="w-3.5 h-3.5 mr-2 text-[#4CAF50]" /> Secured Locally
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-white drop-shadow-2xl">
                WHATS<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CAF50] to-[#128C7E]">WRAPPED</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-medium max-w-lg mx-auto leading-relaxed">
                Relive your most memorable chat moments. Private, secure, and entirely on your device.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-10">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.zip"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="group relative px-12 py-6 bg-white text-black text-xl font-black rounded-full shadow-[0_20px_60px_rgba(76,175,80,0.2)] hover:shadow-[0_25px_70px_rgba(76,175,80,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-4">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 group-hover:-translate-y-1 transition-transform" />
                      EXPLORE YOUR WRAPPED
                    </>
                  )}
                </span>
              </button>

              <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] max-w-lg w-full backdrop-blur-md flex items-start gap-5 text-left group hover:bg-white/10 hover:border-white/10 transition-all duration-500 shadow-2xl">
                <div className="p-3 bg-[#4CAF50]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4CAF50]">Instruction</p>
                  <p className="text-base font-bold text-white/90 leading-tight">
                    WhatsApp Settings &gt; Chats &gt; Export Chat
                  </p>
                  <p className="text-[10px] text-white/30 font-medium italic">"Without Media" works best!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <FeatureItem icon={<ShieldCheck className="w-4 h-4 text-[#4CAF50]" />} title="End-to-End Local" />
              <FeatureItem icon={<BarChart3 className="w-4 h-4 text-[#4CAF50]" />} title="Smart Insights" />
              <FeatureItem icon={<MessageCircle className="w-4 h-4 text-[#4CAF50]" />} title="Vibe Detected" />
            </div>
          </div>
        </main>
      )}

      {/* Main app stays above the fold, secondary info below */}
      {!showStory && (
        <section className="w-full max-w-2xl py-24 px-6 space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Info className="w-6 h-6 text-[#4CAF50]" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Technical Details</h2>
          </div>
          <div className="space-y-4">
            <FAQItem 
              question="Where does my chat file go?"
              answer="Your chat file never leaves your browser window. We use JavaScript to parse and analyze the text locally on your machine. Your privacy is baked into the architecture."
            />
            <FAQItem 
              question="What is the Vibe Check?"
              answer="We use a privacy-safe snippet of your chat stats to query Gemini AI. This generates a fun, personality-driven 'vibe' for your chat history without sending the full conversation content."
            />
            <FAQItem 
              question="Can I use this for group chats?"
              answer="Absolutely! It works for both one-on-one and group chats. The analyzer will automatically identify the most active 'characters' in the group."
            />
          </div>
        </section>
      )}

      {/* Story Mode Overlay */}
      {showStory && stats && aiInsights && (
        <StoryView 
          stats={stats} 
          aiInsights={aiInsights} 
          onClose={() => setShowStory(false)} 
        />
      )}

      {/* Footer */}
      {!showStory && (
        <footer className="w-full max-w-4xl py-24 flex flex-col items-center gap-12 px-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Creator</span>
              <span className="text-white text-2xl font-black tracking-tight">Ayan Karmakar</span>
            </div>
            <div className="flex gap-8">
              <FooterLink href="https://github.com/Ayan-Script" icon={<Github className="w-7 h-7" />} label="GitHub" />
              <FooterLink href="http://instagram.com/the_ayaan.vrs/" icon={<Instagram className="w-7 h-7" />} label="Instagram" />
            </div>
          </div>
          <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.2em] text-center">
            WhatsWrapped • 2025 • Not affiliated with WhatsApp Inc.
          </p>
        </footer>
      )}
    </div>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
    {icon}
    <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">{title}</span>
  </div>
);

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-3xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-500 hover:bg-white/[0.08]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left font-bold text-lg group"
      >
        <span className="group-hover:text-[#4CAF50] transition-colors">{question}</span>
        <div className={`p-1.5 rounded-xl bg-white/5 transition-transform duration-500 ${isOpen ? 'rotate-180 bg-[#4CAF50]/20 text-[#4CAF50]' : ''}`}>
          <ChevronDown className="w-5 h-5 opacity-50" />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-6 pb-6 text-white/50 leading-relaxed font-medium text-sm">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FooterLink: React.FC<{ href: string, icon: React.ReactNode, label: string }> = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="group flex flex-col items-center gap-2"
  >
    <div className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all duration-300 border border-white/10 group-hover:border-[#4CAF50]/50 group-hover:scale-110">
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7 text-white/40 group-hover:text-white transition-colors" })}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors">{label}</span>
  </a>
);

export default App;
