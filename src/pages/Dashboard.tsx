
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Play, Upload, Settings } from "lucide-react";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard: Component mounted with userRole:", userRole);
  }, [userRole]);

  const panels = [
    {
      id: "start-exam",
      title: "Start Exam",
      description: "Begin your radiology examination with available cases",
      icon: Play,
      action: () => navigate("/cases"),
      showFor: ["admin", "trainee", "contributor"],
      bgColor: "bg-medical-primary hover:bg-medical-primary/90",
      textColor: "text-white"
    },
    {
      id: "browse-cases",
      title: "Browse Cases",
      description: "Explore and study available radiology cases",
      icon: BookOpen,
      action: () => navigate("/cases"),
      showFor: ["admin", "trainee", "contributor"],
      bgColor: "bg-medical-secondary hover:bg-medical-secondary/90",
      textColor: "text-white"
    },
    {
      id: "submit-cases",
      title: "Submit Cases",
      description: "Contribute new cases to the platform",
      icon: Upload,
      action: () => navigate("/cases/submit"),
      showFor: ["admin", "contributor"],
      bgColor: "bg-green-600 hover:bg-green-700",
      textColor: "text-white"
    },
    {
      id: "admin-panel",
      title: "Admin Panel",
      description: "Manage users, cases, and platform settings",
      icon: Settings,
      action: () => navigate("/admin"),
      showFor: ["admin"],
      bgColor: "bg-purple-600 hover:bg-purple-700",
      textColor: "text-white"
    }
  ];

  const visiblePanels = panels.filter(panel => 
    panel.showFor.includes(userRole || "")
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-medical-primary">Rad2B Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-medical-dark">{user?.email}</span>
            <Button variant="outline" onClick={signOut} className="border-medical-border">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-medical-border">
          <h2 className="text-xl font-semibold mb-2 text-medical-dark">
            Welcome, {userRole === "admin" ? "Admin" : userRole === "contributor" ? "Contributor" : "Trainee"}!
          </h2>
          <p className="text-medical-muted">
            You're logged in to the Rad2B platform, the advanced radiology examination simulator.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePanels.map((panel) => {
            const IconComponent = panel.icon;
            return (
              <Card 
                key={panel.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-medical-border"
                onClick={panel.action}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-medical-lighter flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-medical-primary" />
                  </div>
                  <CardTitle className="text-medical-dark">{panel.title}</CardTitle>
                  <CardDescription className="text-medical-muted">
                    {panel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className={`w-full ${panel.bgColor} ${panel.textColor}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      panel.action();
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
