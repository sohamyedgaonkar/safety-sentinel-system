import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatWithRachaelProps {
  onComplete: (description: string) => void;
}

const ChatWithRachael = ({ onComplete }: ChatWithRachaelProps) => {
  const { supabase } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const generateDescription = async () => {
    if (messages.length === 0) {
      toast.error("Please have a conversation first before generating a description.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Generating summary with messages:', messages);
      const { data, error } = await supabase.functions.invoke('chat-with-rachael', {
        body: { 
          message: "Please provide a professional summary of this incident based on our conversation and add a Paragragh commenting about authenticity of the incident Reported . Provide Facts and comments supporting your Authenticity Report. Keeping the User Anonymous Add some facts that Authority can verify on reading this Description .Add a authenticity Percentage at the end .Follow this format Incident Report : , Authenticity Report : , Facts to check by Authority : ,Authenticity Percentage :",
          history: messages,
          isSummaryRequest: true
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Summary response:', data);
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from AI');
      }

      const summary = data.choices[0].message.content;
      setIsCompleted(true);
      onComplete(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userInput.trim() || isLoading || isCompleted) return;

    setIsLoading(true);
    const currentInput = userInput;
    setUserInput("");

    const userMessage: ChatMessage = {
      role: "user",
      content: currentInput
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      console.log('Sending message:', currentInput);
      console.log('Message history:', messages);
      
      const { data, error } = await supabase.functions.invoke('chat-with-rachael', {
        body: { message: currentInput, history: messages }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI response:', data);
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from AI');
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.choices[0].message.content
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error("Failed to get response from Rachael. Please try again.");
      // Remove the user's message if we couldn't get a response
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {messages.map((message, index) => (
          message.role !== "system" && (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-8"
                  : "bg-gray-100 mr-8"
              }`}
            >
              <p className="text-sm">
                {message.role === "user" ? "You" : "Rachael"}
              </p>
              <p>{message.content}</p>
            </div>
          )
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            Hi, I'm Rachael, your safety officer. Please tell me about the incident.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response..."
            disabled={isLoading || isCompleted}
          />
          <Button type="submit" disabled={isLoading || isCompleted}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>

        <Button 
          onClick={generateDescription} 
          disabled={isCompleted || messages.length === 0 || isLoading}
          variant="secondary"
          className="w-full"
        >
          {isLoading ? "Generating Summary..." : "Generate Description"}
        </Button>
      </div>
    </div>
  );
};

export default ChatWithRachael;
