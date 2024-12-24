import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, signOut, isAuthority } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            Safety Sentinel
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-primary">
              Report Incident
            </Link>
            <Link to="/analysis" className="text-gray-600 hover:text-primary">
              Analysis
            </Link>
            {user ? (
              <>
                {isAuthority ? (
                  <Link to="/authority" className="text-gray-600 hover:text-primary">
                    Authority Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-primary">
                      My Applications
                    </Link>
                    <Link to="/apply" className="text-gray-600 hover:text-primary">
                      Submit Application
                    </Link>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-primary"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;