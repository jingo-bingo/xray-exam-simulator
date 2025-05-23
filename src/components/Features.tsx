
import React from 'react';
import { Clock, Target, BarChart3, BookOpen, Users, Award } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: "Rapid Reporting Practice",
    description: "Master the 6-minute time limit with our standardized 'Please provide a short report...' question format, exactly as in the FRCR Part 2B exam"
  },
  {
    icon: Target,
    title: "Realistic Exam Simulation",
    description: "Experience authentic exam conditions with case complexity and timing that mirrors the actual FRCR Part 2B examination environment"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress across different regions and difficulty levels with detailed performance metrics and improvement suggestions"
  },
  {
    icon: BookOpen,
    title: "Expert Model Answers",
    description: "Learn from consultant radiologist model answers with detailed explanations and key diagnostic points for each case"
  },
  {
    icon: Users,
    title: "Peer Comparison",
    description: "Compare your performance with other FRCR candidates and identify areas for focused study and improvement"
  },
  {
    icon: Award,
    title: "Structured Learning Path",
    description: "Follow our evidence-based curriculum designed specifically for FRCR Part 2B success with progressive difficulty levels"
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-white to-medical-lighter/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-medical-dark">
            Everything You Need for{" "}
            <span className="text-medical-primary">FRCR Part 2B Success</span>
          </h2>
          <p className="text-xl text-medical-muted max-w-3xl mx-auto leading-relaxed">
            Our platform replicates the exact FRCR Part 2B exam format with real DICOM cases, 
            standardized questions, and expert feedback to maximize your chances of success.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group glass-panel p-8 rounded-xl hover:border-medical-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-medical-primary/10 to-medical-secondary/10 border border-medical-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-medical-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-medical-dark group-hover:text-medical-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-medical-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonial Quote */}
        <div className="mt-20 text-center">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-medical-border max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-medium text-medical-dark mb-4 italic">
              "This platform was instrumental in my FRCR Part 2B success. The standardized rapid reporting format 
              and realistic case complexity gave me the confidence I needed on exam day."
            </blockquote>
            <cite className="text-medical-muted">
              — Dr. Sarah Mitchell, SpR Radiology, Recently Passed FRCR Part 2B
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
