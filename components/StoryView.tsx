
import React, { useState, useEffect, useCallback } from 'react';
import { ChatStats, AiInsights, TypingVibe } from '../types';
import { ChevronLeft, ChevronRight, X, Share2, Award, Zap, Heart, MessageSquare, Clock, Sparkles, Ghost, Fingerprint, Calendar, Image as ImageIcon, Smile, VolumeX, Flame, Phone, Mic, Hash } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface StoryViewProps {
  stats: ChatStats;
  aiInsights: AiInsights;
  onClose: () => void;
}

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

export const StoryView: React.FC<StoryViewProps> = ({ stats, aiInsights, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 5000;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const slides = [
    {
      id: 'intro',
      gradient: 'card-gradient-1',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Logo className="w-32 h-32 mb-8 animate-bounce" />
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">Your Year in Chat.</h1>
          <p className="text-xl opacity-90">Ready to see what {stats.totalMessages.toLocaleString()} messages look like?</p>
        </div>
      )
    },
    {
      id: 'top-contributors',
      gradient: 'card-gradient-2',
      content: (
        <div className="flex flex-col h-full p-8">
          <div className="mb-12">
            <Heart className="w-12 h-12 mb-4 text-red-400" />
            <h2 className="text-4xl font-bold">The Main Characters.</h2>
            <p className="opacity-70 mt-2">The ones who kept the conversation alive.</p>
          </div>
          <div className="flex-1 space-y-6">
            {Object.entries(stats.senders)
              .sort((a, b) => (b[1] as any) - (a[1] as any))
              .slice(0, 3)
              .map(([name, count], i) => (
                <div key={name} className="flex items-center space-x-4 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/5">
                  <div className="text-3xl font-black opacity-30">#{(i as any) + 1}</div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold truncate">{name}</div>
                    <div className="text-sm opacity-60 uppercase tracking-widest font-bold">{(count as any).toLocaleString()} messages</div>
                  </div>
                  <Award className={`w-8 h-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`} />
                </div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'voice-king',
      gradient: 'card-gradient-3',
      content: (
        <div className="flex flex-col h-full p-8">
          <div className="mb-12">
            <Mic className="w-12 h-12 mb-4 text-green-300" />
            <h2 className="text-4xl font-bold">The Podcast Era.</h2>
            <p className="opacity-70 mt-2">Who treated the group chat like their own personal radio show?</p>
          </div>
          <div className="flex-1 space-y-6">
            {Object.entries(stats.voiceUsage)
              .sort((a, b) => (b[1] as any) - (a[1] as any))
              .slice(0, 3)
              .map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between bg-white/10 p-7 rounded-3xl border border-white/5 backdrop-blur-xl">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="text-2xl font-black opacity-10">{(i as any) + 1}</div>
                    <div className="font-bold text-2xl truncate">{name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{(count as any).toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Voice Notes</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'weekly-flow',
      gradient: 'card-gradient-1',
      content: (
        <div className="flex flex-col h-full p-8">
          <div className="mb-8">
            <Calendar className="w-12 h-12 mb-4 text-blue-300" />
            <h2 className="text-4xl font-bold">The Weekly Flow.</h2>
            <p className="mt-2 text-lg opacity-80">Peak activity is on {dayNames[parseInt(Object.entries(stats.weeklyDistribution).sort((a,b) => (b[1] as any) - (a[1] as any))[0][0])]}s.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(stats.weeklyDistribution).map(([day, count]) => ({ day: dayNames[parseInt(day)], count }))}>
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {Object.entries(stats.weeklyDistribution).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ffffff' : '#ffffff80'} />
                  ))}
                </Bar>
                <XAxis dataKey="day" stroke="#ffffff80" fontSize={12} axisLine={false} tickLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'top-repeated-words',
      gradient: 'card-gradient-4',
      content: (
        <div className="flex flex-col h-full p-8">
          <div className="mb-12">
            <Hash className="w-12 h-12 mb-4 text-indigo-400" />
            <h2 className="text-4xl font-bold">Most Repeated.</h2>
            <p className="opacity-70 mt-2">The words that defined your year.</p>
          </div>
          <div className="flex-1 space-y-4">
            {stats.topWords.slice(0, 5).map((wordObj, i) => (
              <div key={wordObj.word} className="flex items-center gap-4 bg-black/20 p-5 rounded-2xl border border-white/5">
                <span className="text-2xl font-black text-white/20">{(i as any) + 1}</span>
                <span className="text-3xl font-black text-white">{wordObj.word}</span>
                <span className="ml-auto text-xs font-bold opacity-40 uppercase tracking-widest">{wordObj.count} times</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'signature-words',
      gradient: 'card-gradient-2',
      content: (
        <div className="flex flex-col h-full p-8 relative">
          <div className="mb-8">
            <Sparkles className="w-12 h-12 mb-4 text-purple-300" />
            <h2 className="text-4xl font-bold">Signature Styles.</h2>
            <p className="opacity-70 mt-2">Everyone has their "thing".</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar relative z-30 pointer-events-auto">
            {Object.entries(stats.senders)
              .sort((a, b) => (b[1] as any) - (a[1] as any))
              .slice(0, 5)
              .map(([name]) => (
                <div key={name} className="bg-black/20 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="text-lg font-black mb-3 text-white/90">{name}'s Top Hits:</div>
                  <div className="flex flex-wrap gap-2">
                    {stats.userSignatureWords[name]?.length > 0 ? (
                      stats.userSignatureWords[name].map(word => (
                        <span key={word} className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-bold border border-white/10">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm italic opacity-50">Words too unique to list...</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'silent-person',
      gradient: 'card-gradient-4',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="relative mb-8">
            <VolumeX className="w-24 h-24 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" />
            <Award className="w-20 h-20 text-white relative z-10" />
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">The Silent Observer.</h2>
          <p className="opacity-70 mb-8 max-w-xs mx-auto text-lg italic">"A person of few words, but likely much thought."</p>
          <div className="bg-white/10 p-10 rounded-[40px] border border-white/20 backdrop-blur-xl w-full">
            <div className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mb-3">Awarded To</div>
            <div className="text-4xl font-black mb-2 text-blue-200">{stats.silentAward?.name || 'The Ghost'}</div>
            <div className="text-lg opacity-60 font-bold">Just {stats.silentAward?.count || 0} messages sent</div>
          </div>
        </div>
      )
    },
    {
      id: 'vibe-check',
      gradient: 'card-gradient-1',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Sparkles className="w-16 h-16 mb-6 text-yellow-300" />
          <h2 className="text-xl font-bold opacity-60 mb-2 uppercase tracking-[0.3em]">The Verdict</h2>
          <div className="text-6xl font-black mb-8 leading-tight tracking-tighter">
            {aiInsights.vibe}
          </div>
          <div className="space-y-6 w-full">
            <p className="text-xl font-medium italic opacity-90 px-4 leading-relaxed">"{aiInsights.friendshipSummary}"</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {aiInsights.insideJokes.map(joke => (
                <span key={joke} className="px-5 py-2.5 bg-black/40 rounded-full text-sm font-black border border-white/20 shadow-xl">
                  #{joke}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'summary',
      gradient: 'card-gradient-5',
      content: (
        <div className="flex flex-col items-center h-full p-8 overflow-y-auto custom-scrollbar relative z-30 pointer-events-auto">
           <div className="w-full bg-white/10 p-10 rounded-[48px] border border-white/10 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] mt-4">
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col items-start gap-3">
                <Logo className="w-12 h-12" />
                <div>
                  <h3 className="text-2xl font-black tracking-tighter leading-none">WHATS WRAPPED</h3>
                  <p className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase">Ayan Karmakar</p>
                </div>
              </div>
              <Share2 className="w-6 h-6 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
            <div className="space-y-8 text-left">
              <div className="flex justify-between border-b border-white/5 pb-4 items-center">
                <span className="opacity-40 font-black text-[10px] uppercase tracking-widest">Total Energy</span>
                <span className="font-black text-3xl">{stats.totalMessages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4 items-center">
                <span className="opacity-40 font-black text-[10px] uppercase tracking-widest">MVP</span>
                <span className="font-black text-2xl truncate ml-4 text-right">
                  {Object.entries(stats.senders).sort((a,b) => (b[1] as any) - (a[1] as any))[0][0]}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4 items-center">
                <span className="opacity-40 font-black text-[10px] uppercase tracking-widest">Vibe Status</span>
                <span className="font-black text-2xl truncate ml-4 text-right text-[#4CAF50]">{aiInsights.vibe}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-40 font-black text-[10px] uppercase tracking-widest">Peak Hour</span>
                <span className="font-black text-2xl">{Object.entries(stats.hourlyDistribution).sort((a,b) => (b[1] as any) - (a[1] as any))[0][0]}:00</span>
              </div>
            </div>
            <div className="mt-12 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em]">
              PRIVACY SAFE • LOCAL PROCESSING
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 px-12 py-6 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shrink-0 mb-12 shadow-2xl flex items-center gap-3"
          >
            <Zap className="w-5 h-5 fill-current" />
            START OVER
          </button>
        </div>
      )
    }
  ];

  const next = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex(prev => prev + 1);
      setProgress(0);
    }
  }, [activeIndex, slides.length]);

  const prev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [activeIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + (100 / (DURATION / 100));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-700 ${slides[activeIndex].gradient}`}>
      <div className="relative w-full max-w-lg h-full max-h-[90vh] md:aspect-[9/16] overflow-hidden shadow-2xl md:rounded-[56px] flex flex-col">
        
        {/* Progress System */}
        <div className="absolute top-8 left-0 right-0 z-[60] flex px-6 gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i < activeIndex ? '100%' : i === activeIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Global Controls */}
        <div className="absolute top-12 right-6 z-[60] flex gap-4">
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-colors pointer-events-auto backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Story Content */}
        <div className="relative flex-1 w-full overflow-hidden z-20">
          {slides[activeIndex].content}
        </div>

        {/* Multi-Zone Navigation Overlay */}
        <div className="absolute inset-0 flex z-50 pointer-events-none">
          <div className="w-[30%] h-full cursor-pointer pointer-events-auto" onClick={prev} />
          <div className="flex-1 h-full" />
          <div className="w-[30%] h-full cursor-pointer pointer-events-auto" onClick={next} />
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex fixed top-1/2 -translate-y-1/2 left-8 z-50">
        <button 
          onClick={prev}
          disabled={activeIndex === 0}
          className="p-6 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 backdrop-blur-2xl transition-all hover:scale-110 border border-white/10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="hidden md:flex fixed top-1/2 -translate-y-1/2 right-8 z-50">
        <button 
          onClick={next}
          disabled={activeIndex === slides.length - 1}
          className="p-6 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 backdrop-blur-2xl transition-all hover:scale-110 border border-white/10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
