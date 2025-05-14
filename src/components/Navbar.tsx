
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-900 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">RadExam</Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
          <Link to="/features" className="text-white hover:text-gray-300 transition-colors">Features</Link>
          <Link to="/about" className="text-white hover:text-gray-300 transition-colors">About</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-gray-300 transition-colors">Dashboard</Link>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 mt-2 py-4 px-4 absolute left-0 right-0 z-50">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
            <Link to="/features" className="text-white hover:text-gray-300 transition-colors">Features</Link>
            <Link to="/about" className="text-white hover:text-gray-300 transition-colors">About</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-gray-300 transition-colors">Dashboard</Link>
                <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
