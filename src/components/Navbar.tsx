import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-medical-border py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden text-medical-dark focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-medical-dark hover:text-medical-primary transition-colors">Home</Link>
          <Link to="/features" className="text-medical-dark hover:text-medical-primary transition-colors">Features</Link>
          <Link to="/about" className="text-medical-dark hover:text-medical-primary transition-colors">About</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-medical-dark hover:text-medical-primary transition-colors">Dashboard</Link>
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
        <div className="md:hidden bg-white border-t border-medical-border mt-2 py-4 px-4 absolute left-0 right-0 z-50 shadow-lg">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-medical-dark hover:text-medical-primary transition-colors">Home</Link>
            <Link to="/features" className="text-medical-dark hover:text-medical-primary transition-colors">Features</Link>
            <Link to="/about" className="text-medical-dark hover:text-medical-primary transition-colors">About</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-medical-dark hover:text-medical-primary transition-colors">Dashboard</Link>
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
