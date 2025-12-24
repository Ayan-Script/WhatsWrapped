
import React from 'react';

export interface Message {
  date: string;
  time: string;
  sender: string;
  content: string;
  hour: number;
  timestamp: number;
}

export interface TypingVibe {
  persona: string;
  description: string;
}

export interface ChatStats {
  totalMessages: number;
  senders: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  weeklyDistribution: Record<number, number>; // 0 (Sun) to 6 (Sat)
  monthlyDistribution: Record<string, number>;
  topWords: Array<{ word: string; count: number }>;
  userSignatureWords: Record<string, string[]>;
  mostActiveDay: string;
  typingVibes: Record<string, TypingVibe>;
  lastInReceipt: Record<string, number>;
  mediaUsage: Record<string, number>; // Total media sent per person
  voiceUsage: Record<string, number>; // Specifically voice messages
  slangUsage: Record<string, number>; // Count of slang words per person
  emojiRatio: Record<string, number>; // Emoji count / Total messages
  silentAward: { name: string; count: number } | null;
  rapidFireCount: Record<string, number>; // Count of multi-message bursts
}

export interface StorySlide {
  id: string;
  title: string;
  content: React.ReactNode;
  gradientClass: string;
}

export interface AiInsights {
  vibe: string;
  insideJokes: string[];
  friendshipSummary: string;
}
