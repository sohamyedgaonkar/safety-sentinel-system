import React from "react";
import { Phone, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Directly import and initialize the Twilio client.
// WARNING: This exposes your credentials in the client bundle.
const twilio = require("twilio");
// For ESM you could also use: import twilio from "twilio";

const accountSid = "ACa52693c3730b55eb4e3a3d1307d538c6";
const authToken = "0919ab90ef40b208d2aa293bdcce035b";
const client = twilio(accountSid, authToken);

async function createCall() {
  try {
    const call = await client.calls.create({
      from: "+17152603930",            // Your Twilio phone number
      to: "+918468976955",              // Static destination number
      url: "http://demo.twilio.com/docs/voice.xml", // URL for TwiML instructions
    });
    console.log("Call initiated. SID:", call.sid);
  } catch (error) {
    console.error("Error initiating call:", error);
  }
}

const EmergencyContacts = () => {
  const contacts = [
    {
      title: "Emergency Helpline",
      number: "911",
      description: "24/7 Emergency Services",
      icon: Phone,
    },
    {
      title: "Women's Safety Hotline",
      number: "1-800-799-7233",
      description: "National Domestic Violence Hotline",
      icon: Shield,
    },
    {
      title: "Crisis Counseling",
      number: "1-800-273-8255",
      description: "24/7 Crisis Support",
      icon: Heart,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {contacts.map((contact) => (
        <Card key={contact.title} className="animate-fadeIn">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <contact.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{contact.title}</CardTitle>
            </div>
            <CardDescription>{contact.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={createCall} // This button always calls the static number
            >
              {contact.number}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyContacts;
