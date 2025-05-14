
import React from 'react';
import { Image, Search, Settings, FileText } from 'lucide-react';

const features = [
  {
    icon: Image,
    title: "DICOM Visualization",
    description: "Advanced visualization tools for DICOM images with zoom, pan, and window level adjustment"
  },
  {
    icon: Search,
    title: "Detailed Analysis",
    description: "Precision measurement tools and annotation capabilities for comprehensive radiological analysis"
  },
  {
    icon: FileText,
    title: "Case Management",
    description: "Organize and navigate through different patient cases with comprehensive clinical histories"
  },
  {
    icon: Settings,
    title: "Examination Settings",
    description: "Customize viewing parameters and layouts to match your clinical workflow"
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-radiology-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Powerful Diagnostic Tools</h2>
          <p className="text-radiology-light/80 max-w-2xl mx-auto">
            Our platform provides everything radiologists need for accurate diagnosis and efficient workflow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-panel p-6 rounded-lg hover:border-radiology-accent/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-radiology-accent/10 border border-radiology-accent/20 flex items-center justify-center mb-5">
                <feature.icon className="h-6 w-6 text-radiology-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-radiology-light/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
