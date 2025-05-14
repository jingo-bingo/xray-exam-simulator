
import React from 'react';
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1a1a1a_0%,#0a0a0a_100%)] z-0"></div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Advanced Radiology Examination <span className="text-radiology-accent">Simulator</span>
          </h1>
          <p className="text-xl text-radiology-light/90 mb-8 max-w-2xl mx-auto">
            A professional web application for radiologists to practice, learn, and perfect their diagnostic skills with realistic DICOM images.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-radiology-accent hover:bg-radiology-accent/90 text-white h-12 px-8 text-base">
              Start Examination
            </Button>
            <Button variant="outline" className="border-radiology-muted text-radiology-light hover:text-white hover:bg-radiology-muted/30 h-12 px-8 text-base">
              View Demo
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-20">
        <div className="glass-panel p-4 overflow-hidden relative max-w-5xl mx-auto animate-slide-up animation-delay-200">
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-radiology-darker">
            <div className="w-full h-full bg-gradient-to-br from-radiology-muted/10 to-radiology-dark flex items-center justify-center">
              <p className="text-radiology-light/50">Radiology Examination Interface Preview</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-radiology-darker to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
