import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');

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

Ask only ONE question at a time, waiting for the user's response before moving to the next question.

If this is the start of the conversation:
1. First, ask only about when the incident occurred (date and time)
2. After getting the date, ask only about the location
3. Then, one by one, ask about:
   - What happened
   - Who was involved
   - Any witnesses
   - Actions taken
   - Available evidence

Keep each question concise, clear, and sensitive to the situation. Wait for the user's response before asking the next question. If the user's response needs clarification, ask for it before moving to the next topic.`
    };

    // Combine history with the current message
    const messages: ChatMessage[] = [
      systemMessage,
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages,
        temperature: isSummaryRequest ? 0.3 : 0.7, // Lower temperature for more focused summaries
        top_p: 0.7,
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