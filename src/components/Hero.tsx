
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-medical-lighter to-white">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-medical-dark">
          Advanced Radiology Examination Simulator
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-medical-muted">
          Master diagnostic skills with our comprehensive DICOM-based case library. Perfect for medical students, residents, and practicing radiologists.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Button size="lg" asChild className="bg-medical-primary hover:bg-medical-primary/90">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="bg-medical-primary hover:bg-medical-primary/90">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
