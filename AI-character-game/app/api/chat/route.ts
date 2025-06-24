import { NextRequest, NextResponse } from 'next/server';

interface Character {
  id: string;
  name: string;
  personality: string;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { message, character }: { message: string; character: Character } = await request.json();

    if (!message || !character) {
      return NextResponse.json({ error: 'Message and character are required' }, { status: 400 });
    }

    // Build conversation history with character personality
    const messages = [
      {
        role: 'system' as const,
        content: `${character.personality}

Remember to stay in character and refer to previous conversations when relevant. Keep responses concise but engaging, around 1-3 sentences. Your name is ${character.name}.`
      },
      // Include recent conversation history for context
      ...character.conversation.slice(-6).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Use OpenAI-compatible API (you can replace this with your preferred LLM)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      // Fallback response if API fails
      const fallbackResponses = {
        wizard: "The mystical energies are clouded today, dear seeker. Perhaps we shall speak again when the cosmic winds are clearer.",
        warrior: "My sword arm grows restless! Let us speak of this matter another time when battle calls less urgently.",
        merchant: "Ah, business is booming elsewhere! I must attend to a profitable venture, but we'll talk trade soon!",
        scholar: "My studies require immediate attention. Let us continue this fascinating discussion when I return from the archives."
      };
      
      return NextResponse.json({ 
        response: fallbackResponses[character.id as keyof typeof fallbackResponses] || 
                 "I seem to be lost in thought at the moment. Could you try speaking to me again?"
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I didn't catch that. Could you say that again?";

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Return a friendly error response
    return NextResponse.json({ 
      response: "I seem to be having trouble understanding right now. Could you try again?" 
    });
  }
} 