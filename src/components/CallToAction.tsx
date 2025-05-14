
import React from 'react';
import { Button } from "@/components/ui/button";

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#1a1a1a_0%,#0a0a0a_100%)] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-2xl border border-radiology-accent/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to improve your diagnostic skills?</h2>
            <p className="text-xl text-radiology-light/90 max-w-2xl mx-auto">
              Join thousands of radiologists who use our platform for continuous professional development.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-radiology-accent hover:bg-radiology-accent/90 text-white h-12 px-8 text-base">
              Get Started Now
            </Button>
            <Button variant="outline" className="border-radiology-muted text-radiology-light hover:text-white hover:bg-radiology-muted/30 h-12 px-8 text-base">
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
