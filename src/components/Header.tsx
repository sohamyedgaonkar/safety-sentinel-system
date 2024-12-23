import { Link } from "react-router-dom";

const Header = () => {
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
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;