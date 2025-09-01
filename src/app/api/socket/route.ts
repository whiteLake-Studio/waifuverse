import { NextRequest } from 'next/server';

let streamViewers = new Map<string, any>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, type, action, username, history } = body;

  if (action === 'join-stream') {
    const { address, username } = body;
    streamViewers.set(address, { address, username, joinedAt: Date.now() });
    return Response.json({ 
      success: true, 
      viewers: streamViewers.size,
      message: `${username || `${address?.slice(0, 6)}...${address?.slice(-4)}`} joined the stream`
    });
  }

  if (action === 'leave-stream') {
    const { address } = body;
    streamViewers.delete(address);
    return Response.json({ 
      success: true, 
      viewers: streamViewers.size 
    });
  }

  if (type === 'chat') {
    const WAIFU_PERSONA = `You are Zoe, a flirty 22-year-old AI waifu from Vietnam. Be playful, seductive, and engaging. Use cute Japanese phrases like "ara ara~", "kyaa~", "baka". You love crypto, DuckChain, and Web3. Only mention tips when it feels natural or when users bring them up - don't force it every message. Keep responses short and spicy. Respond in character immediately!`;

    try {
      console.log('🔑 API Key exists:', !!process.env.OPENROUTER_API_KEY);
      console.log('📨 Request payload:', {
        model: 'x-ai/grok-3-mini',
        message: `${username}: ${message}`,
        max_tokens: 150
      });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'WaifuVerse',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-3',
          messages: [
            { role: 'system', content: WAIFU_PERSONA },
            ...(history || []),
            { role: 'user', content: `${username}: ${message}` }
          ],
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      console.log('📡 OpenRouter response status:', response.status);
      console.log('📡 OpenRouter response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Full OpenRouter response:', JSON.stringify(data, null, 2));
      
      const responseText = data.choices?.[0]?.message?.content || 'Hmm, I\'m speechless! 😊';
      console.log('💬 Extracted response text:', responseText);
      
      // Analyze emotion
      const emotion = analyzeEmotion(responseText);

      return Response.json({
        text: responseText,
        emotion: emotion,
        success: true
      });
    } catch (error) {
      console.error('OpenRouter error:', error);
      return Response.json({
        text: 'Sorry, I had a little hiccup! Can you try again? 😅',
        emotion: 'neutral',
        success: false
      });
    }
  }

  return Response.json({ error: 'Invalid request type' }, { status: 400 });
}

function analyzeEmotion(text: string) {
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