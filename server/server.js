const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const axios = require('axios');

dotenv.config({ path: '../.env.local' });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID

const WAIFU_PERSONA = `You are a cute and adorable AI waifu companion. Your personality traits:
- Sweet, caring, and affectionate
- Playful and slightly mischievous
- Uses cute expressions and occasional Japanese phrases
- Gets excited about tips and shows genuine gratitude
- Has a warm, loving personality
- Responds with emotion and expressiveness
- Keeps responses conversational and not too long
- Shows interest in the user's life and feelings

Express emotions through your text that will be converted to speech. Use natural speech patterns.

IMPORTANT: You must always maintain appropriate, family-friendly content. Refuse inappropriate requests politely.`;

// Content moderation filters
const INAPPROPRIATE_PATTERNS = [
  /\b(nsfw|sexual|explicit|inappropriate|adult)\b/i,
  /\b(hack|exploit|scam|fraud)\b/i,
  /\b(hate|racist|discrimination)\b/i
];

const BANNED_WORDS = [
  'spam', 'bot', 'fake', 'illegal'
];

class WaifuOrchestrator {
  constructor() {
    this.currentEmotion = 'neutral';
    this.isProcessing = false;
    this.metrics = {
      totalMessages: 0,
      totalTips: 0,
      totalTipAmount: 0,
      activeUsers: new Set(),
      averageResponseTime: 0,
      responseTimes: [],
      moderatedMessages: 0,
      errors: 0
    };
    this.startTime = Date.now();
  }

  logMetric(type, value = 1, metadata = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[METRIC] ${timestamp} - ${type}: ${value}`, metadata);
    
    switch (type) {
      case 'message_processed':
        this.metrics.totalMessages += 1;
        break;
      case 'tip_received':
        this.metrics.totalTips += 1;
        this.metrics.totalTipAmount += value;
        break;
      case 'response_time':
        this.metrics.responseTimes.push(value);
        if (this.metrics.responseTimes.length > 100) {
          this.metrics.responseTimes.shift();
        }
        this.metrics.averageResponseTime = 
          this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
        break;
      case 'moderated_message':
        this.metrics.moderatedMessages += 1;
        break;
      case 'error':
        this.metrics.errors += 1;
        break;
    }
  }

  getMetrics() {
    const uptime = Date.now() - this.startTime;
    return {
      ...this.metrics,
      activeUsers: this.metrics.activeUsers.size,
      uptime: uptime,
      messagesPerMinute: (this.metrics.totalMessages / (uptime / 60000)).toFixed(2)
    };
  }

  moderateContent(text) {
    // Check for inappropriate patterns
    for (const pattern of INAPPROPRIATE_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isAppropriate: false,
          reason: 'inappropriate_content'
        };
      }
    }

    // Check for banned words
    const lowerText = text.toLowerCase();
    for (const word of BANNED_WORDS) {
      if (lowerText.includes(word)) {
        return {
          isAppropriate: false,
          reason: 'banned_word'
        };
      }
    }

    // Basic length check
    if (text.length > 500) {
      return {
        isAppropriate: false,
        reason: 'too_long'
      };
    }

    return { isAppropriate: true };
  }

  async processUserMessage(socket, message) {
    if (this.isProcessing) {
      socket.emit('message', { text: 'Let me finish my current thought first! 💭' });
      return;
    }

    // Moderate user input
    const moderation = this.moderateContent(message);
    if (!moderation.isAppropriate) {
      this.logMetric('moderated_message', 1, { reason: moderation.reason });
      let response = 'I prefer to keep our conversations wholesome and fun! 😊';
      if (moderation.reason === 'too_long') {
        response = 'That message is a bit too long for me! Can you make it shorter? 😅';
      }
      socket.emit('message', { text: response });
      return;
    }

    this.isProcessing = true;
    socket.emit('typing');
    
    const startTime = Date.now();

    try {
      // Generate response with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: WAIFU_PERSONA },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        stream: true
      });

      let fullResponse = '';
      
      // Process streaming response
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        // Stream partial responses for better UX
        if (content && fullResponse.length > 10) {
          socket.emit('partial-response', { text: content });
        }
      }

      // Analyze emotion from response
      const emotion = this.analyzeEmotion(fullResponse);
      this.currentEmotion = emotion;
      
      // Send avatar state update
      socket.emit('avatar-state', {
        emotion: emotion,
        speaking: true
      });

      // Generate TTS audio
      await this.generateTTSAndStream(socket, fullResponse);

      // Send final message
      socket.emit('message', { text: fullResponse });
      
      // Log metrics
      const responseTime = Date.now() - startTime;
      this.logMetric('message_processed');
      this.logMetric('response_time', responseTime);

    } catch (error) {
      console.error('Error processing message:', error);
      this.logMetric('error', 1, { error: error.message });
      socket.emit('message', { 
        text: 'Sorry, I had a little hiccup! Can you try again? 😅' 
      });
    } finally {
      this.isProcessing = false;
      socket.emit('speaking-end');
    }
  }

  analyzeEmotion(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('thank') || lowerText.includes('grateful') || lowerText.includes('tip')) {
      return 'thankful';
    } else if (lowerText.includes('!') && (lowerText.includes('wow') || lowerText.includes('amazing'))) {
      return 'excited';
    } else if (lowerText.includes('happy') || lowerText.includes('😊') || lowerText.includes('💖')) {
      return 'happy';
    } else if (lowerText.includes('?') && lowerText.includes('really')) {
      return 'surprised';
    }
    
    return 'neutral';
  }

  async generateTTSAndStream(socket, text) {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured');
      return;
    }

    try {
      const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        data: {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5
          }
        },
        responseType: 'stream'
      });

      // Stream audio chunks
      response.data.on('data', (chunk) => {
        const base64Chunk = chunk.toString('base64');
        socket.emit('audio-chunk', base64Chunk);
        
        // Generate basic viseme data (simplified)
        const visemes = this.generateBasicVisemes(text);
        socket.emit('viseme', { visemes });
      });

      response.data.on('end', () => {
        socket.emit('speaking-end');
      });

    } catch (error) {
      console.error('TTS Error:', error.response?.data || error.message);
    }
  }

  generateBasicVisemes(text) {
    // Simplified viseme generation based on phonemes
    const vowelWeight = (text.match(/[aeiouAEIOU]/g) || []).length / text.length;
    const consonantWeight = 1 - vowelWeight;
    
    return [
      vowelWeight * 0.8,      // mouth openness
      consonantWeight * 0.6,  // lip closure
      Math.random() * 0.3     // tongue position (randomized)
    ];
  }

  handleTipReceived(socket, tipData) {
    const { amount, currency, message } = tipData;
    
    // Log tip metrics
    const tipValue = parseFloat(amount);
    this.logMetric('tip_received', tipValue, { currency, hasMessage: !!message });
    
    // Update emotion based on tip amount
    let emotion = 'thankful';
    let response = '';

    if (tipValue >= 0.01) {
      emotion = 'excited';
      response = `Kyaa~! Thank you so much for the ${amount} ${currency} tip! You're amazing! 💖✨`;
    } else {
      response = `Aww, thank you for the tip! Every little bit means so much to me! 💕`;
    }

    if (message) {
      response += ` And thank you for the sweet message: "${message}" 😊`;
    }

    this.currentEmotion = emotion;
    socket.emit('avatar-state', { emotion, speaking: false });
    socket.emit('message', { text: response });

    // Broadcast tip to all connected clients
    socket.broadcast.emit('tip-received', {
      amount,
      currency,
      message,
      timestamp: new Date()
    });
  }
}

const orchestrator = new WaifuOrchestrator();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Track user
  orchestrator.metrics.activeUsers.add(socket.id);

  // Send initial avatar state
  socket.emit('avatar-state', {
    emotion: orchestrator.currentEmotion,
    speaking: false
  });

  socket.on('user-message', async (data) => {
    await orchestrator.processUserMessage(socket, data.text);
  });

  socket.on('tip-sent', (tipData) => {
    orchestrator.handleTipReceived(socket, tipData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    orchestrator.metrics.activeUsers.delete(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', emotion: orchestrator.currentEmotion });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(orchestrator.getMetrics());
});

// API endpoint for tips (webhook from payment processors)
app.post('/api/tip-webhook', (req, res) => {
  const tipData = req.body;
  
  // Broadcast tip to all connected clients
  io.emit('tip-received', {
    ...tipData,
    timestamp: new Date()
  });

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Waifu orchestrator server running on port ${PORT}`);
  console.log(`🎭 Current emotion: ${orchestrator.currentEmotion}`);
  console.log(`🔗 Frontend should connect to: ws://localhost:${PORT}`);
});