
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Billing = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    const firstName = user?.user_metadata?.first_name || "";
    const lastName = user?.user_metadata?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="text-2xl font-bold text-medical-dark">Billing</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Current Status */}
          <Card className="mb-8 border-medical-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-medical-dark">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Free Trial Active
              </CardTitle>
              <CardDescription className="text-medical-muted">
                You're currently on a free trial with access to basic features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Trial Benefits:</p>
                <ul className="text-green-700 text-sm mt-2 space-y-1">
                  <li>• Access to free trial cases</li>
                  <li>• Basic practice mode</li>
                  <li>• Limited case attempts</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <h2 className="text-2xl font-semibold mb-6 text-medical-dark">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-medical-border">
              <CardHeader>
                <CardTitle className="text-medical-dark">Basic Plan</CardTitle>
                <CardDescription className="text-medical-muted">Perfect for individual learners</CardDescription>
                <div className="text-3xl font-bold text-medical-primary">$29<span className="text-lg text-medical-muted">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-medical-dark">
                  <li>• Access to all cases</li>
                  <li>• Unlimited practice attempts</li>
                  <li>• Detailed explanations</li>
                  <li>• Progress tracking</li>
                </ul>
                <Button className="w-full mt-4 bg-medical-primary hover:bg-medical-primary/90" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-medical-border border-medical-primary">
              <CardHeader>
                <CardTitle className="text-medical-dark">Premium Plan</CardTitle>
                <CardDescription className="text-medical-muted">For serious exam preparation</CardDescription>
                <div className="text-3xl font-bold text-medical-primary">$49<span className="text-lg text-medical-muted">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-medical-dark">
                  <li>• Everything in Basic</li>
                  <li>• Advanced analytics</li>
                  <li>• Timed exam simulations</li>
                  <li>• Priority support</li>
                  <li>• Case submission privileges</li>
                </ul>
                <Button className="w-full mt-4 bg-medical-primary hover:bg-medical-primary/90" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Information */}
          <Card className="border-medical-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-medical-dark">
                <CreditCard className="h-6 w-6" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment System Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  We're working on implementing our subscription and payment system. 
                  You'll be able to manage your billing information here once it's ready.
                </p>
                <p className="text-sm text-gray-500">
                  For now, enjoy your free trial access to explore the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Billing;
