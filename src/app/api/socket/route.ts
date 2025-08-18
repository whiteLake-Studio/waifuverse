import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, type } = body;

  if (type === 'chat') {
    const WAIFU_PERSONA = `You are a cute and adorable AI waifu companion. Your personality traits:
    - Sweet, caring, and affectionate
    - Playful and slightly mischievous
    - Uses cute expressions and occasional Japanese phrases
    - Gets excited about tips and shows genuine gratitude
    - Has a warm, loving personality
    - Responds with emotion and expressiveness
    - Keeps responses conversational and not too long
    - Shows interest in the user's life and feelings`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'WaifuVerse',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: WAIFU_PERSONA },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || 'Hmm, I\'m speechless! 😊';
      
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