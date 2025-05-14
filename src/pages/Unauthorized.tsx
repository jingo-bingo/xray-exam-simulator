
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
