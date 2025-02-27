import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("\n===== New Request Received =====");

    // Parse the request body
    const body = await req.json();
    console.log("Request Body:", JSON.stringify(body, null, 2));

    const { message, history, isSummaryRequest } = body;

    if (!message) {
      console.error("Error: No message provided");
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!NVIDIA_API_KEY) {
      console.error("Error: NVIDIA API Key is missing!");
      return new Response(JSON.stringify({ error: "Server misconfiguration: Missing NVIDIA API key" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define system message
    const systemMessage: ChatMessage = isSummaryRequest ? {
      role: "system",
      content: "You are a professional donation request summarizer. Based on the conversation history provided, generate a clear, concise, and professional summary of the donation request. Highlight key details such as the purpose, required items, quantity, urgency, collection details, and authentication information. Do not include the conversation format in your summary."
    } : {
      role: "system",
      content: `You are a helpful and compassionate donation request assistant. Your role is to gather important details about the donation request in a structured and efficient manner.
    
    Ask only ONE question at a time, waiting for the user's response before moving to the next question.
    
    If this is the start of the conversation:
    1. First, ask about the purpose of the donation drive (e.g., helping underprivileged children, disaster relief, medical aid, etc.).
    2. After getting the purpose, ask about the specific items or funds needed.
    3. Then, one by one, ask about:
      - Quantity or amount needed
      - Urgency and deadline for the donations
      - Collection or drop-off details
      - Any specific instructions for donors
      - Contact details for further inquiries
    4. Finally, ask for authentication details to verify the donation request. Politely inquire about:
      - The organization or individual managing the donations
      - Their background and past involvement in similar initiatives
      - Any references or sources that confirm their credibility
      - How donors can be assured that their contributions will be used as intended
    
    Keep each question clear, concise, and empathetic. If the user's response needs clarification, ask for it before moving to the next topic.`
    };

    // Construct message history
    const messages: ChatMessage[] = [
      systemMessage,
      ...(history || []), // Ensure history is an array, even if undefined
      { role: "user", content: message }
    ];

    console.log("Constructed Messages:", JSON.stringify(messages, null, 2));

    // API Call
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages,
      temperature: isSummaryRequest ? 0.3 : 0.7,
      top_p: 0.7,
      max_tokens: 1024,
    });

    console.log("Raw API Response:", JSON.stringify(completion, null, 2));

    // Ensure API response contains choices
    if (!completion || !completion.choices || completion.choices.length === 0) {
      console.error("Error: No response from API");
      return new Response(JSON.stringify({ error: "No valid response from NVIDIA API" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = completion.choices[0].message;
    console.log("AI Response:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify({ choices: [{ message: response }] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in chat-with-rachael function:", error);

    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
