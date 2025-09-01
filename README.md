# WaifuVerse - Interactive AI Waifu on Duckchain

A real-time AI waifu companion built on Duckchain blockchain with OnchainKit, featuring conversational AI, voice synthesis, and crypto tipping.

## 🚀 Features

- **Real-time Chat**: WebSocket-based chat with AI waifu companion
- **Voice Synthesis**: ElevenLabs TTS for natural voice responses
- **3D Avatar**: Three.js-powered avatar with emotion expression
- **Content Moderation**: Basic safety filters for appropriate conversations
- **Real-time Metrics**: Performance monitoring and user analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Web3**: Duckchain, Wagmi, Viem
- **Backend**: Node.js, Express, Socket.io
- **AI**: grok
- **Voice**: ElevenLabs TTS API
- **3D**: Three.js for avatar rendering

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Base Sepolia testnet access
- API keys for:
  - OpenAI
  - ElevenLabs
  - WalletConnect (optional)

## 🔧 Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env

# WalletConnect Project ID (get from WalletConnect Cloud)
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id

# Socket server URL for real-time communication
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001

# Backend API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Create `server/.env`:

```env
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
PORT=3001
```

### 3. Run the Application

Start the backend server:
```bash
cd server
npm run dev
```

In a new terminal, start the frontend:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `OPENAI_API_KEY`

### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create an account and get API key
3. Add to `ELEVENLABS_API_KEY`

## 🎮 Usage

1. **Connect Wallet**: Use the wallet button to connect your Duckchain-compatible wallet
2. **Chat**: Type messages to interact with your AI waifu
3. **Send Tips**: Use the tipping panel to send crypto tips
4. **Watch Avatar**: See emotion changes based on conversation and tips

## 📊 Monitoring

Access real-time metrics at:
- Health check: `http://localhost:3001/health`
- Metrics dashboard: `http://localhost:3001/metrics`

Key metrics tracked:
- Active users
- Message processing time
- Total tips received
- Content moderation events
- Error rates

## 🔧 Development

### Frontend Structure
```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── ChatInterface.tsx
│   ├── AvatarRenderer.tsx
│   └── TippingPanel.tsx
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

### Backend Structure
```
server/
├── server.js        # Main orchestrator service
├── package.json     # Dependencies
└── .env            # Environment variables
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Render)
1. Connect your GitHub repo
2. Set environment variables
3. Deploy the `server` directory

## 🔒 Security Considerations

- Content moderation filters implemented
- Input validation on all user messages
- Rate limiting recommended for production
- API key protection
- Wallet signature verification

## 📈 Performance Optimization

- WebSocket connection pooling
- Audio streaming for low latency
- Component memoization
- Efficient 3D rendering

## 🐛 Troubleshooting

### Common Issues

**Wallet not connecting:**
- Ensure you're on Duckchain mainnet
- Check OnchainKit API key is valid

**Voice not working:**
- Verify ElevenLabs API key
- Check browser audio permissions

**Backend errors:**
- Verify all environment variables are set
- Check OpenAI API quota

## 📝 License

MIT License - see LICENSE file for details.
