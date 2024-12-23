import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">SafeGuard</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">
            Report Incident
          </a>
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">
            Resources
          </a>
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">
            Emergency Contacts
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="default">Get Help Now</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;