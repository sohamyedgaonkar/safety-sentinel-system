
import React, { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Donor = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for actual submission logic
      // You would implement actual data submission to Supabase here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Message submitted successfully");
      setMessage("");
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to submit message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 space-y-8">
        <section className="text-center space-y-4 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary">Donor Portal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your contributions make a difference. Share your message of support or inquire about donation opportunities.
          </p>
        </section>

        <section className="max-w-2xl mx-auto animate-fadeIn">
          <Card className="p-6 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Message"}
              </Button>
            </form>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 animate-fadeIn">
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Why Donate?</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Support women's safety initiatives</li>
              <li>• Fund educational programs</li>
              <li>• Help improve reporting technology</li>
              <li>• Contribute to community outreach</li>
            </ul>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Impact of Your Support</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Enhanced safety resources for women</li>
              <li>• Improved incident response times</li>
              <li>• Expanded safety education programs</li>
              <li>• Better data analytics for prevention</li>
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Donor;
