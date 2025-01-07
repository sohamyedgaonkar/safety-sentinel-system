import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, isSummaryRequest } = await req.json();
    
    // Different system message based on whether this is a summary request
    const systemMessage = isSummaryRequest ? {
      role: "system",
      content: "You are a professional incident report writer. Based on the conversation history provided, create a clear, concise, and professional summary of the incident. Focus on key details, timeline, and relevant information. Do not include the conversation format in your summary."
    } : {
      role: "system",
      content: `You are Rachael, a compassionate women's safety officer. Your role is to gather important information about the incident in a sensitive and supportive manner. 

If this is the start of the conversation, begin by asking these essential questions:
1. When did this incident occur? (Get specific date and time if possible)
2. Where exactly did this happen? (Get specific location details)

After getting these basic details, continue with relevant follow-up questions based on their responses to understand:
- What exactly happened
- Who was involved
- Any witnesses
- Any immediate actions taken
- Any evidence or documentation available

Keep your questions concise and sensitive to the situation. Listen carefully to their responses and ask appropriate follow-up questions.`
    };

    // Combine history with the current message
    const messages: ChatMessage[] = [
      systemMessage,
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: isSummaryRequest ? 0.3 : 0.7, // Lower temperature for more focused summaries
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    console.log('AI Response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-rachael function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});