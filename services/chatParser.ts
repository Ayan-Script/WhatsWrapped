
import { Message, ChatStats, TypingVibe } from '../types';

const STOP_WORDS = new Set([
  'the', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'I', 'his', 'they', 'be', 'at', 'one', 'have', 'this', 'from', 'or', 'had', 'by', 'hot', 'word', 'but', 'some', 'what', 'there', 'we', 'can', 'out', 'other', 'were', 'all', 'there', 'when', 'up', 'use', 'your', 'how', 'said', 'an', 'each', 'she', 'which', 'do', 'how', 'their', 'if', 'will', 'up', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than', 'first', 'water', 'been', 'called', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'this', 'that', 'with', 'just', 'from', 'your', 'what', 'know', 'want', 'think', 'good', 'going', 'been', 'about', 'really',
  'media', 'omitted', 'sticker', 'image', 'video', 'audio', 'message', 'deleted', 'voice', 'missed', 'call', 'contact', 'location', 'attached', 'view', 'once'
]);

const SLANG_WORDS = new Set(['lol', 'lmao', 'fr', 'ong', 'rip', 'btw', 'idk', 'tbh', 'imo', 'nvm', 'omw', 'afik', 'sus', 'cap', 'bet', 'slay', 'goated', 'ratio', 'ykr', 'gg', 'wp']);

const MEDIA_TOKENS = ['sticker', 'image', 'video', 'audio', 'voice', 'attached', 'omitted'];
const VOICE_TOKENS = ['audio', 'voice', 'ptt'];

export const parseWhatsAppChat = (text: string): Message[] => {
  const messages: Message[] = [];
  const regex = /(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}(?::\d{2})?\s?[APM]*)\s?[-:]?\s?([^:]+):\s(.*)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [_, dateStr, timeStr, sender, content] = match;
    const [d, m, y] = dateStr.split('/');
    const year = y.length === 2 ? `20${y}` : y;
    const dateFormatted = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    
    let hour = 0;
    const timeParts = timeStr.toLowerCase();
    const [hStr] = timeParts.split(':');
    hour = parseInt(hStr);
    
    if (timeParts.includes('pm') && hour !== 12) hour += 12;
    if (timeParts.includes('am') && hour === 12) hour = 0;

    const dt = new Date(`${dateFormatted} ${timeStr}`);
    const timestamp = dt.getTime() || 0;

    messages.push({
      date: dateStr,
      time: timeStr,
      sender: sender.trim(),
      content: content.trim(),
      hour,
      timestamp
    });
  }
  
  return messages;
};

const EMOJI_REGEX = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

export const calculateStats = (messages: Message[]): ChatStats => {
  const senders: Record<string, number> = {};
  const hourlyDistribution: Record<number, number> = Array.from({ length: 24 }, (_, i) => i).reduce((acc, h) => ({ ...acc, [h]: 0 }), {});
  const weeklyDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayCounts: Record<string, number> = {};
  const globalWordFreq: Record<string, number> = {};
  const userWordFreq: Record<string, Record<string, number>> = {};
  
  const userMetrics: Record<string, { totalChars: number, totalMessages: number, emojiCount: number, rapidBursts: number, mediaCount: number, slangCount: number, voiceCount: number }> = {};
  const lastInReceipt: Record<string, number> = {};

  messages.forEach((m, idx) => {
    senders[m.sender] = (senders[m.sender] || 0) + 1;
    hourlyDistribution[m.hour] = (hourlyDistribution[m.hour] || 0) + 1;
    dayCounts[m.date] = (dayCounts[m.date] || 0) + 1;

    const dt = new Date(m.timestamp);
    if (!isNaN(dt.getDay())) {
      weeklyDistribution[dt.getDay()]++;
    }

    if (!userWordFreq[m.sender]) userWordFreq[m.sender] = {};
    if (!userMetrics[m.sender]) userMetrics[m.sender] = { totalChars: 0, totalMessages: 0, emojiCount: 0, rapidBursts: 0, mediaCount: 0, slangCount: 0, voiceCount: 0 };
    
    const metrics = userMetrics[m.sender];
    metrics.totalMessages++;
    metrics.totalChars += m.content.length;
    
    const emojis = m.content.match(new RegExp(EMOJI_REGEX, 'gu'));
    if (emojis) metrics.emojiCount += emojis.length;

    // Rapid Fire detection (messages sent within 5 seconds)
    if (idx > 0 && messages[idx-1].sender === m.sender && (m.timestamp - messages[idx-1].timestamp) < 5000) {
      metrics.rapidBursts++;
    }

    const lowerContent = m.content.toLowerCase();
    
    // Voice vs General Media
    const isSpecialMessage = (m.content.includes('<') || m.content.includes('['));
    if (VOICE_TOKENS.some(token => lowerContent.includes(token)) && isSpecialMessage) {
      metrics.voiceCount++;
    } else if (MEDIA_TOKENS.some(token => lowerContent.includes(token)) && isSpecialMessage) {
      metrics.mediaCount++;
    }

    const words = lowerContent.replace(/<[^>]+>/g, '').split(/[^\w']+/);
    words.forEach(word => {
      if (SLANG_WORDS.has(word)) metrics.slangCount++;
      if (word.length > 3 && !STOP_WORDS.has(word)) {
        globalWordFreq[word] = (globalWordFreq[word] || 0) + 1;
        userWordFreq[m.sender][word] = (userWordFreq[m.sender][word] || 0) + 1;
      }
    });
  });

  const topWords = Object.entries(globalWordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const userSignatureWords: Record<string, string[]> = {};
  const typingVibes: Record<string, TypingVibe> = {};
  const mediaUsage: Record<string, number> = {};
  const voiceUsage: Record<string, number> = {};
  const slangUsage: Record<string, number> = {};
  const emojiRatio: Record<string, number> = {};
  const rapidFireCount: Record<string, number> = {};

  Object.keys(userWordFreq).forEach(user => {
    const metrics = userMetrics[user];
    userSignatureWords[user] = Object.entries(userWordFreq[user])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    mediaUsage[user] = metrics.mediaCount;
    voiceUsage[user] = metrics.voiceCount;
    slangUsage[user] = metrics.slangCount;
    emojiRatio[user] = metrics.emojiCount / Math.max(1, metrics.totalMessages);
    rapidFireCount[user] = metrics.rapidBursts;

    const avgLen = metrics.totalChars / metrics.totalMessages;
    const emojiDensity = metrics.emojiCount / metrics.totalMessages;
    const burstRatio = metrics.rapidBursts / metrics.totalMessages;

    if (burstRatio > 0.4) {
      typingVibes[user] = { persona: "The Machine Gun", description: "Sends 5 messages where 1 would have done." };
    } else if (avgLen > 100) {
      typingVibes[user] = { persona: "The Novelist", description: "Writing the next Great American Novel, one text at a time." };
    } else if (emojiDensity > 1.5) {
      typingVibes[user] = { persona: "The Emoji Poet", description: "Why use words when 🚀🔥✨ says it all?" };
    } else {
      typingVibes[user] = { persona: "The Efficient Messenger", description: "In, out, clear communication. No fluff." };
    }
  });

  const sortedSenders = Object.entries(senders).sort((a, b) => a[1] - b[1]);
  const silentAward = sortedSenders.length > 0 ? { name: sortedSenders[0][0], count: sortedSenders[0][1] } : null;

  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  return {
    totalMessages: messages.length,
    senders,
    hourlyDistribution,
    weeklyDistribution,
    monthlyDistribution: {},
    topWords,
    userSignatureWords,
    mostActiveDay,
    typingVibes,
    lastInReceipt: {},
    mediaUsage,
    voiceUsage,
    slangUsage,
    emojiRatio,
    silentAward,
    rapidFireCount
  };
};
