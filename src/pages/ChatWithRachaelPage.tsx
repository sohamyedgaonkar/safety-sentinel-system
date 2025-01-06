import { useNavigate } from "react-router-dom";
import ChatWithRachael from "@/components/ChatWithRachael";
import { Button } from "@/components/ui/button";

const ChatWithRachaelPage = () => {
  const navigate = useNavigate();

  const handleChatComplete = (description: string) => {
    // Store the description in localStorage
    localStorage.setItem("incidentDescription", description);
    navigate("/");
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Chat with Rachael</h1>
      <p className="text-gray-600 mb-6 text-center">
        Rachael will help you describe the incident. After the conversation, 
        you'll be redirected back to the incident form with your description.
      </p>
      <ChatWithRachael onComplete={handleChatComplete} />
      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => navigate("/")}
      >
        Back to Incident Form
      </Button>
    </div>
  );
};

export default ChatWithRachaelPage;