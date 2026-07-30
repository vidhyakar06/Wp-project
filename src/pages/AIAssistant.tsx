import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const suggestedQuestions = [
  'Which crop grows well in normal soil during monsoon season?',
  'What fertilizer is best when soil lacks nitrogen?',
  'How to control pests organically?',
  'What are the best watering methods for small farms?',
  'What government schemes are available for farmers?',
  'When is the best time to harvest paddy?',
];

const knowledgeBase: Record<string, string> = {
  'loamy soil kharif': 'For normal farm soil in monsoon season, the best crops are Paddy, Sugarcane, Maize, Soybean, and Cotton. These grow well in soil that holds water nicely and stays warm (25-35°C). Paddy is the most popular choice, giving about 4-5 tons per acre.',
  'fertilizer nitrogen': 'When soil lacks nitrogen, apply Urea (50-100 kg per acre) in parts every 15 days. You can also use Farm Yard Manure (10-20 tons per acre) before planting. For organic options, Vermicompost (2-5 tons per acre) and green manure crops like Sesbania work well.',
  'pest organic': 'For natural pest control: 1) Use Neem oil spray (5ml per liter water) every 7-10 days. 2) Use helpful insects like ladybugs. 3) Use natural fungus (Trichoderma) to fight plant diseases. 4) Plant marigold to attract pests away from main crops. 5) Apply cow dung + urine mixture (Jeevamrutham) as a natural pesticide. 6) Use special traps to catch pests.',
  'irrigation small': 'For small farms, the best watering methods are: 1) Drip watering - saves 50-70% water, ideal for vegetables. 2) Sprinkler watering - good for close-growing crops. 3) Rain gun - affordable for small farms. 4) Cover soil with leaves/straw to keep moisture. Government help is available for drip watering under PMKSY scheme.',
  'government scheme': 'Key government schemes for farmers: 1) PM-KISAN: ₹6,000/year income help. 2) PMKSY: Up to 55% discount on drip/sprinkler watering. 3) KCC (Kisan Credit Card): Low-interest loans at 4%. 4) PMFBY: Crop insurance at low cost (2% for monsoon crops, 1.5% for winter crops). 5) Soil Health Card: Free soil testing. 6) eNAM: Online selling platform for better prices.',
  'harvest paddy': 'The best time to harvest paddy is when: 1) 80-85% of grains turn golden yellow. 2) Grain moisture is 20-22%. 3) The seed stalks start drying. Harvesting too early leads to lower yield and quality. After harvesting, dry grains to 14% moisture for storage. The ideal harvesting time is usually 120-140 days after planting seedlings, depending on the variety.',
};

function getResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, response] of Object.entries(knowledgeBase)) {
    if (key.split(' ').every((word) => lower.includes(word))) {
      return response;
    }
  }
  return "I'm here to help with farming questions! I can help with crop suggestions, fertilizer advice, pest control, watering methods, harvesting, organic farming, and government schemes. Please ask your question differently or pick a topic below.";
}

export default function AIAssistant() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;
    const userMsg: Message = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(query);
      const aiMsg: Message = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1200);
  };

  const handleClear = () => {
    setMessages([]);
    showToast('Conversation cleared', 'info');
  };

  return (
    <div>
      <PageHeader
        title="AI Farming Assistant"
        subtitle="Get instant answers to your farming questions"
        icon={<Bot className="w-6 h-6" />}
        action={messages.length > 0 ? <Button variant="ghost" onClick={handleClear} icon={<Trash2 className="w-4 h-4" />}>Clear</Button> : undefined}
      />

      <Card className="flex flex-col h-[600px]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-4">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ask me anything about farming!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                I can help with crop suggestions, fertilizer advice, pest control, watering, harvesting, and government schemes.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-8 max-w-2xl w-full">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-sm text-slate-700 dark:text-slate-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600'
                    : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-secondary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 flex gap-1.5">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                    className="w-2 h-2 rounded-full bg-slate-400"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a farming question..."
              className="input-field flex-1"
            />
            <Button onClick={() => handleSend()} disabled={!input.trim()} icon={<Send className="w-4 h-4" />}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
