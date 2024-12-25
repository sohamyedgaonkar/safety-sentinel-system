import Header from "@/components/Header";
import IncidentForm from "@/components/IncidentForm";
import EmergencyContacts from "@/components/EmergencyContacts";
import Resources from "@/components/Resources";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 space-y-8">
        <section className="text-center space-y-4 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary">
            Women's Safety Incident Reporting System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your safety matters. Report incidents, access resources, and connect with support services.
            We're here to help you stay safe and informed.
          </p>
          {user && (
            <Link to="/dashboard">
              <Button variant="outline" className="mt-4">
                View Dashboard
              </Button>
            </Link>
          )}
        </section>

        <section id="report" className="animate-fadeIn">
          <h2 className="text-2xl font-bold text-center mb-6">Report an Incident</h2>
          <IncidentForm />
        </section>

        <section id="emergency-contacts" className="animate-fadeIn">
          <h2 className="text-2xl font-bold text-center mb-6">Emergency Contacts</h2>
          <EmergencyContacts />
        </section>

        <section id="resources" className="animate-fadeIn">
          <Resources />
        </section>
      </main>
    </div>
  );
};

export default Index;