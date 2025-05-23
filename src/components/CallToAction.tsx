
import React from 'react';
import { Button } from "@/components/ui/button";

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 md:py-24 relative bg-gradient-to-br from-medical-primary/5 to-medical-secondary/5">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-2xl border border-medical-border">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-medical-dark">Ready to improve your diagnostic skills?</h2>
            <p className="text-xl text-medical-muted max-w-2xl mx-auto">
              Join thousands of radiologists who use our platform for continuous professional development.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white h-12 px-8 text-base">
              Get Started Now
            </Button>
            <Button variant="outline" className="border-medical-border text-medical-primary hover:text-white hover:bg-medical-primary/10 h-12 px-8 text-base">
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
