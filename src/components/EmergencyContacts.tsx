
import { Phone, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
              onClick={() => window.location.href = `tel:${contact.number}`}
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
