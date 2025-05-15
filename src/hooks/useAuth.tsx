import { createContext, useContext, useEffect, useState, useRef, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export type UserRole = "admin" | "trainee";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Keep track of fetch in progress to prevent duplicate fetches
  const fetchingRole = useRef(false);

  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    // Prevent duplicate fetches and race conditions
    if (fetchingRole.current) return;
    fetchingRole.current = true;
    
    try {
      console.log("AuthProvider: Fetching user role for user:", userId);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      // Only update state if component is still mounted
      if (!isMounted.current) return;

      if (error) {
        console.error("AuthProvider: Error fetching user role:", error);
        setUserRole(null);
      } else {
        console.log("AuthProvider: User role fetched:", data.role);
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("AuthProvider: Error in fetchUserRole:", error);
      if (isMounted.current) {
        setUserRole(null);
      }
    } finally {
      fetchingRole.current = false;
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("AuthProvider: Auth state changed:", event);
        
        if (!isMounted.current) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Use setTimeout to avoid potential Supabase auth deadlocks when 
        // onAuthStateChange calls trigger other auth operations
        if (newSession?.user) {
          setTimeout(() => {
            if (isMounted.current) {
              fetchUserRole(newSession.user.id);
            }
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("AuthProvider: Got existing session:", currentSession ? "yes" : "no");
      
      if (!isMounted.current) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(`Error signing in: ${error.message}`);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;
      toast.success("Registration successful! Please check your email to confirm your account.");
    } catch (error: any) {
      toast.error(`Error signing up: ${error.message}`);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
      toast.success("Signed out successfully!");
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    userRole,
    signIn,
    signUp,
    signOut,
    isLoading,
  }), [user, session, userRole, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
