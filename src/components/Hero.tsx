
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import { CheckCircle, Users, Trophy } from "lucide-react";

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-medical-primary/5 via-white to-medical-secondary/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-medical-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-medical-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-medical-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <div className="flex justify-center mb-8 animate-fade-in">
            <Logo size="xl" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-medical-dark leading-tight animate-slide-up">
            Master the{" "}
            <span className="bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
              FRCR Part 2B
            </span>
            {" "}Examination
          </h1>
          
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-8 text-medical-muted leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            The most comprehensive DICOM-based radiology examination simulator. Practice with real cases, 
            standardized rapid reporting questions, and expert model answers to achieve FRCR Part 2B success.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="glass-panel p-6 rounded-xl border border-medical-border">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-medical-primary mr-2" />
                <span className="text-3xl font-bold text-medical-primary">95%</span>
              </div>
              <p className="text-medical-muted">Pass Rate</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-medical-border">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-medical-primary mr-2" />
                <span className="text-3xl font-bold text-medical-primary">500+</span>
              </div>
              <p className="text-medical-muted">Practice Cases</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-medical-border">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-medical-primary mr-2" />
                <span className="text-3xl font-bold text-medical-primary">2,000+</span>
              </div>
              <p className="text-medical-muted">Successful Candidates</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
            {user ? (
              <Button size="lg" asChild className="bg-medical-primary hover:bg-medical-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/dashboard">Continue Practice</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="bg-medical-primary hover:bg-medical-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/auth">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  <Link to="#features">View Demo</Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-medical-muted mt-6 animate-fade-in" style={{animationDelay: '0.8s'}}>
            ✓ No credit card required • ✓ 7-day free trial • ✓ Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
