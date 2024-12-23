import { BookOpen, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Resources = () => {
  const resources = [
    {
      title: "Safety Guidelines",
      description: "Learn about personal safety measures and preventive actions.",
      link: "#",
    },
    {
      title: "Legal Resources",
      description: "Information about your rights and legal support options.",
      link: "#",
    },
    {
      title: "Support Groups",
      description: "Connect with others and find community support.",
      link: "#",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <BookOpen className="h-6 w-6" />
        Helpful Resources
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.title} className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={resource.link}
                className="text-primary hover:text-primary/80 flex items-center gap-2"
              >
                Learn More <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Resources;