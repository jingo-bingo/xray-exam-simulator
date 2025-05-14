
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-radiology-darker py-12 border-t border-radiology-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-semibold text-white">RadExam</span>
              <span className="bg-radiology-accent text-white text-xs px-2 py-0.5 rounded">BETA</span>
            </div>
            <p className="text-radiology-light/70 mb-4 max-w-md">
              Advanced radiology examination simulation platform designed for professional radiologists and medical students.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Case Library</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Research</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-radiology-light/70 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-radiology-muted/30 mt-8 pt-8 text-center">
          <p className="text-radiology-light/50 text-sm">
            &copy; {new Date().getFullYear()} RadExam. All rights reserved. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
