
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-radiology-light">
          Advanced Radiology Examination Simulator
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-radiology-light/80">
          Master diagnostic skills with our comprehensive DICOM-based case library. Perfect for medical students, residents, and practicing radiologists.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
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
