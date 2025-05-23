
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative bg-gradient-to-br from-medical-primary/10 via-white to-medical-secondary/10">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 bg-medical-primary rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-medical-secondary rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-medical-dark">
              Ready to Pass Your{" "}
              <span className="bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
                FRCR Part 2B?
              </span>
            </h2>
            <p className="text-xl text-medical-muted max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful radiologists who used our platform to master the FRCR Part 2B examination. 
              Start your journey to exam success today.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-panel p-6 rounded-xl border border-medical-border text-center">
              <CheckCircle className="h-8 w-8 text-medical-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark mb-2">7-Day Free Trial</h3>
              <p className="text-sm text-medical-muted">Full access to all features, no credit card required</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-medical-border text-center">
              <CheckCircle className="h-8 w-8 text-medical-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark mb-2">500+ Practice Cases</h3>
              <p className="text-sm text-medical-muted">Comprehensive case library across all specialties</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-medical-border text-center">
              <CheckCircle className="h-8 w-8 text-medical-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark mb-2">Expert Model Answers</h3>
              <p className="text-sm text-medical-muted">Learn from consultant radiologist feedback</p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="glass-panel p-8 md:p-12 rounded-2xl border-2 border-medical-primary/20 bg-gradient-to-r from-white to-medical-lighter/50">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-medical-dark mb-4">
                Start Your FRCR Part 2B Preparation Today
              </h3>
              <p className="text-lg text-medical-muted mb-8 max-w-2xl mx-auto">
                Limited time offer: Get 30% off your first month when you sign up before your exam session.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                <Button size="lg" asChild className="bg-medical-primary hover:bg-medical-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  <Link to="#features">
                    View Sample Cases
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-medical-muted">
                <span>✓ Cancel anytime</span>
                <span className="hidden sm:block">•</span>
                <span>✓ 30-day money-back guarantee</span>
                <span className="hidden sm:block">•</span>
                <span>✓ Instant access</span>
              </div>
            </div>
          </div>

          {/* Urgency Element */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-medical-secondary/10 border border-medical-secondary/20 rounded-full px-6 py-2">
              <span className="text-medical-secondary font-semibold">⚡ Next FRCR Part 2B session starts soon - Don't wait!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
