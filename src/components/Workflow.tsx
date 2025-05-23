
import React from 'react';
import { PlayCircle, Timer, FileText, CheckCircle2 } from 'lucide-react';

const Workflow: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: PlayCircle,
      title: "Select FRCR Case",
      description: "Choose from our extensive library of authentic FRCR Part 2B cases, organized by region and complexity level.",
      highlight: "Real exam cases"
    },
    {
      number: "02", 
      icon: Timer,
      title: "6-Minute Rapid Reporting",
      description: "Practice with the exact exam format: 'Please provide a short report including a description of the abnormality and your diagnosis.'",
      highlight: "Timed practice"
    },
    {
      number: "03",
      icon: FileText,
      title: "Submit Your Report", 
      description: "Write your structured report focusing on key findings and differential diagnoses within the time limit.",
      highlight: "Structured reporting"
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Expert Feedback",
      description: "Compare your answer with consultant radiologist model answers and receive detailed performance analysis.",
      highlight: "Learn from experts"
    }
  ];

  return (
    <section id="workflow" className="py-20 md:py-28 bg-gradient-to-br from-medical-primary/5 to-medical-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-medical-dark">
            FRCR Part 2B{" "}
            <span className="text-medical-primary">Exam Simulation</span>
          </h2>
          <p className="text-xl text-medical-muted max-w-3xl mx-auto leading-relaxed">
            Experience the exact FRCR Part 2B examination process with our authentic simulation platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="glass-panel p-8 rounded-xl h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-medical-border hover:border-medical-primary/30">
                <div className="flex items-center mb-6">
                  <div className="text-3xl font-bold text-medical-primary/20 mr-4">{step.number}</div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-medical-primary/10 to-medical-secondary/10 border border-medical-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-6 w-6 text-medical-primary" />
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block bg-medical-primary/10 text-medical-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {step.highlight}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-medical-dark group-hover:text-medical-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-medical-muted leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-[-16px] transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-medical-primary to-medical-secondary"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-medical-secondary border-y-2 border-y-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Exam Format Highlight */}
        <div className="mt-16 text-center">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border-2 border-medical-primary/20 max-w-4xl mx-auto bg-gradient-to-r from-medical-primary/5 to-medical-secondary/5">
            <h3 className="text-2xl font-bold text-medical-dark mb-4">Authentic FRCR Part 2B Format</h3>
            <div className="bg-white/80 p-6 rounded-xl border border-medical-border">
              <p className="text-lg font-medium text-medical-dark italic">
                "Please provide a short report including a description of the abnormality and your diagnosis."
              </p>
            </div>
            <p className="text-medical-muted mt-4">
              Practice with the exact question format used in the FRCR Part 2B examination
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
