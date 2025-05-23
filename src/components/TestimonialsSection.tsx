
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Dr. James Chen",
    role: "SpR Year 4, Radiology",
    location: "London",
    content: "The standardized rapid reporting practice was game-changing. I felt completely prepared for the 6-minute time limit and passed on my first attempt.",
    rating: 5,
    examResult: "Passed FRCR Part 2B - First Attempt"
  },
  {
    name: "Dr. Priya Patel", 
    role: "Consultant Radiologist",
    location: "Manchester",
    content: "I recommend this platform to all my trainees. The case complexity and expert model answers perfectly mirror the actual exam standard.",
    rating: 5,
    examResult: "FRCR Examiner & Trainer"
  },
  {
    name: "Dr. Michael Roberts",
    role: "SpR Year 5, Radiology", 
    location: "Edinburgh",
    content: "After struggling with time management, this platform helped me master the rapid reporting format. The performance analytics showed exactly where to focus my studies.",
    rating: 5,
    examResult: "Passed FRCR Part 2B - 95th Percentile"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-medical-lighter/50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-medical-dark">
            Trusted by{" "}
            <span className="text-medical-primary">FRCR Success Stories</span>
          </h2>
          <p className="text-xl text-medical-muted max-w-3xl mx-auto leading-relaxed">
            Join the community of radiologists who achieved FRCR Part 2B success with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glass-panel p-8 rounded-xl border border-medical-border hover:border-medical-primary/30 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="h-8 w-8 text-medical-primary/20 absolute -top-2 -left-2" />
                <p className="text-medical-dark leading-relaxed italic pl-6">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="border-t border-medical-border pt-4">
                <div className="font-semibold text-medical-dark">{testimonial.name}</div>
                <div className="text-sm text-medical-muted">{testimonial.role}</div>
                <div className="text-sm text-medical-muted">{testimonial.location}</div>
                <div className="mt-2">
                  <span className="inline-block bg-medical-primary/10 text-medical-primary text-xs font-semibold px-3 py-1 rounded-full">
                    {testimonial.examResult}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Statistics */}
        <div className="mt-16 text-center">
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-medical-border max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-medical-dark mb-6">Proven Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-medical-primary mb-2">95%</div>
                <p className="text-medical-muted">Pass rate among regular users</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-medical-primary mb-2">2,000+</div>
                <p className="text-medical-muted">Successful FRCR candidates</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-medical-primary mb-2">4.9/5</div>
                <p className="text-medical-muted">Average user rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
