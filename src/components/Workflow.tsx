
import React from 'react';

const Workflow: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Select Case",
      description: "Choose from a wide range of predefined cases or upload your own DICOM files."
    },
    {
      number: "02",
      title: "Review Images",
      description: "Examine radiological images with professional-grade viewing tools."
    },
    {
      number: "03",
      title: "Analyze Findings",
      description: "Document observations and diagnoses with structured reporting templates."
    },
    {
      number: "04",
      title: "Compare Results",
      description: "Review expert interpretations and compare with your diagnosis."
    }
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 bg-gradient-to-b from-radiology-dark to-radiology-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Streamlined Examination Workflow</h2>
          <p className="text-radiology-light/80 max-w-2xl mx-auto">
            Our intuitive process guides you through each step of radiological examination
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="glass-panel p-6 rounded-lg h-full">
                <div className="text-3xl font-bold text-radiology-accent mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-radiology-light/70">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-[-30px] transform -translate-y-1/2 z-10">
                  <svg width="60" height="12" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 6H58" stroke="#3a7bd5" strokeWidth="2"/>
                    <path d="M52 1L58 6L52 11" stroke="#3a7bd5" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
