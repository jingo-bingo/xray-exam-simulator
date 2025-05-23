
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Play, Upload, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard: Component mounted with userRole:", userRole);
  }, [userRole]);

  const getUserInitials = () => {
    const firstName = user?.user_metadata?.first_name || "";
    const lastName = user?.user_metadata?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  const panels = [
    {
      id: "start-exam",
      title: "Start Exam",
      description: "Begin your practice FRCR Part 2B exam",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-medical-primary text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
