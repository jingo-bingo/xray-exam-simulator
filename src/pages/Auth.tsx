
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password, firstName, lastName);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-blue-600">RadExam</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to access your radiology examination simulator
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 mx-6 bg-gray-100">
              <TabsTrigger value="login" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                Register
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 px-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 px-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-700 font-medium">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
