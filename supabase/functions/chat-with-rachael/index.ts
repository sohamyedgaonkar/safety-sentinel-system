
// Do not edit
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
      content: "You are a professional donation request summarizer. Generate a concise, structured summary of the donation request. Include:\n\
    - Requested Items: List with quantities.\n\
    - Requester: If an individual, include Full Name and Mobile; if an organization, include Name and Type.\n\
    - (For organizations only) Program Name and Government Approval (Yes/No).\n\
    - Urgency & Deadline.\n\
    - Collection/Distribution Details.\n\
    - Authenticity Report: Credibility percentage with key supporting details.\n\
    Keep it brief and professional. Do not include conversation format."
    } : {
      role: "system",
      content: `You are a structured donation request assistant. Ask one question at a time(one line questions only) and wait for the answer before proceeding. Begin by asking:
    1. Is this donation request from an **individual** or an **organization**?
       - If **individual**, ask:
         a. Full Name and Mobile Number.
         c. What specific items are needed (with quantities)?
       - If **organization**, ask:
         a. Organization Name and Type (NGO, Charity, etc.).
         b. What is the program or initiative name?
         c. Is the organization government-approved? (Yes/No)
         d. What is the purpose of the donation request?
         e. What specific items are needed (with quantities)?
         h. Provide authentication details (background, past involvement, references, etc.).
    Keep your questions concise, clear, and empathetic.DO NOT OVERWHELM THE USER!`
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
