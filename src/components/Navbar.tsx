
import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 w-full bg-radiology-darker/80 backdrop-blur-sm z-50 border-b border-radiology-muted/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-white">RadExam</span>
          <span className="bg-radiology-accent text-white text-xs px-2 py-0.5 rounded">BETA</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          <a href="#features" className="text-radiology-light hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="text-radiology-light hover:text-white transition-colors">Workflow</a>
          <a href="#about" className="text-radiology-light hover:text-white transition-colors">About</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-radiology-light hover:text-white hover:bg-radiology-muted">Log in</Button>
          <Button className="bg-radiology-accent hover:bg-radiology-accent/90 text-white">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
