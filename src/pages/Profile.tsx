
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Lock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || "");
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = () => {
    // Profile update logic would go here
    toast.success("Profile updated successfully!");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    // Password change logic would go here
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mr-4 border-medical-border hover:bg-medical-lighter"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-medical-primary">Profile Settings</h1>
          </div>
          <Button variant="outline" onClick={signOut} className="border-medical-border">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="border-medical-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-medical-primary" />
                <CardTitle className="text-medical-dark">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-medical-muted">
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-medical-muted">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>
              <Button onClick={handleUpdateProfile} className="bg-medical-primary hover:bg-medical-primary/90">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password */}
          <Card className="border-medical-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-medical-primary" />
                <CardTitle className="text-medical-dark">Change Password</CardTitle>
              </div>
              <CardDescription className="text-medical-muted">
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
              <Button 
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Billing (Future) */}
          <Card className="border-medical-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-medical-primary" />
                <CardTitle className="text-medical-dark">Billing & Subscription</CardTitle>
              </div>
              <CardDescription className="text-medical-muted">
                Manage your subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-medical-muted mb-4">Billing features are coming soon.</p>
                <Button variant="outline" disabled className="border-medical-border">
                  View Billing Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
