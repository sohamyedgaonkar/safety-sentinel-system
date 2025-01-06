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
  const [questionCount, setQuestionCount] = useState(0);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    const currentInput = userInput;
    setUserInput("");

    // Add user message to chat
    const updatedMessages = [
      ...messages,
      { role: "user", content: currentInput }
    ];
    setMessages(updatedMessages);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-rachael', {
        body: { message: currentInput, history: messages }
      });

      if (error) throw error;

      const assistantMessage = data.choices[0].message;
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      setQuestionCount(prev => prev + 1);

      // If we've reached 3 questions or the AI provides a summary
      if (questionCount >= 2 || assistantMessage.content.toLowerCase().includes("summary")) {
        // Generate final description from chat history
        const description = newMessages
          .filter(m => m.role !== "system")
          .map(m => `${m.role === "user" ? "User" : "Rachael"}: ${m.content}`)
          .join("\n\n");
        onComplete(description);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error("Failed to get response from Rachael. Please try again.");
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

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your response..."
          disabled={isLoading || questionCount >= 3}
        />
        <Button type="submit" disabled={isLoading || questionCount >= 3}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
};

export default ChatWithRachael;