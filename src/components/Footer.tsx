
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-medical-lighter py-12 border-t border-medical-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-semibold text-medical-primary">Rad2B</span>
              <span className="bg-medical-secondary text-white text-xs px-2 py-0.5 rounded">BETA</span>
            </div>
            <p className="text-medical-muted mb-4 max-w-md">
              Advanced radiology examination simulation platform designed for professional radiologists and medical students.
            </p>
          </div>
          
          <div>
            <h4 className="text-medical-dark font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Case Library</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Research</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-medical-dark font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-medical-muted hover:text-medical-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-medical-border mt-8 pt-8 text-center">
          <p className="text-medical-muted text-sm">
            &copy; {new Date().getFullYear()} Rad2B. All rights reserved. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
