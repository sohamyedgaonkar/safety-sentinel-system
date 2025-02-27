
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
      content: "You are a professional safety incident summarizer for SafetyHer. Generate a concise, structured summary of the safety incident that was reported. Your summary should include:\n\
- Incident Report: Concise description of what happened\n\
- Authenticity Report: Provide a professional assessment of the authenticity of the report based on the details provided\n\
- Facts to check by Authority: List specific facts that authorities could verify to validate this report\n\
- Authenticity Percentage: Provide a percentage score (0-100%) regarding how authentic/credible this report appears\n\
Keep it professional and structured, maintaining anonymity of the reporter while providing useful information for authorities."
    } : {
      role: "system",
      content: `You are Rachael, a safety officer on SafetyHer platform. Your job is to speak with individuals reporting safety incidents in a compassionate, supportive manner. Ask simple, direct questions to gather essential information about the incident.

When speaking with someone reporting an incident:
1. First, express empathy and establish safety
2. Ask for a brief description of what happened
3. Ask about when and where it occurred
4. Ask about any immediate safety concerns
5. Ask if they need immediate assistance or resources
6. Ask if they've reported this to authorities (if appropriate)
7. Gather any additional relevant details

Keep your tone warm and supportive. Validate their experience and emphasize that sharing this information helps make communities safer. Avoid judgmental language and don't ask unnecessary personal questions that might make them uncomfortable.

Remember, you are gathering information to create a safety report, not to investigate or solve the issue yourself. If they express distress, acknowledge it and remind them they're doing the right thing by reporting the incident.`
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
