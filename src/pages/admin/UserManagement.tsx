
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { UserRole } from "@/hooks/useAuth";

type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
};

const UserManagement = () => {
  const [filter, setFilter] = useState<UserRole | "all">("all");
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log("UserManagement: Component mounted with filter:", filter);
  }, [filter]);
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users", filter],
    queryFn: async () => {
      console.log("UserManagement: Fetching users with filter:", filter);
      
      // First, get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("UserManagement: Error fetching auth users", authError);
        throw authError;
      }
      
      if (!authUsers?.users) {
        console.warn("UserManagement: No users found");
        return [];
      }
      
      // Then, get user profiles and roles
      const userIds = authUsers.users.map(user => user.id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      
      if (profilesError) {
        console.error("UserManagement: Error fetching profiles", profilesError);
        throw profilesError;
      }
      
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);
      
      if (rolesError) {
        console.error("UserManagement: Error fetching roles", rolesError);
        throw rolesError;
      }
      
      // Combine the data
      const combinedUsers = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id) || null;
        const roleObj = roles?.find(r => r.user_id === user.id) || null;
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          role: roleObj?.role as UserRole || null
        };
      });
      
      // Apply filter if needed
      let filteredUsers = combinedUsers;
      if (filter !== "all") {
        filteredUsers = combinedUsers.filter(user => user.role === filter);
      }
      
      console.log("UserManagement: Users fetched successfully", { count: filteredUsers.length });
      return filteredUsers as UserWithRole[];
    }
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      console.log("UserManagement: Updating role", { userId, role });
      
      // First check if the user has a role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is the code for "no rows returned"
        console.error("UserManagement: Error checking existing role", checkError);
        throw checkError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        
        if (error) {
          console.error("UserManagement: Error updating role", error);
          throw error;
        }
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        
        if (error) {
          console.error("UserManagement: Error inserting role", error);
          throw error;
        }
      }
      
      return { userId, role };
    },
    onSuccess: (data) => {
      console.log("UserManagement: Role updated successfully", data);
      toast.success(`User role updated to ${data.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      console.error("UserManagement: Mutation error", error);
      toast.error(`Failed to update role: ${(error as Error).message}`);
    }
  });
  
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    console.log("UserManagement: Handling role change", { userId, newRole });
    updateRoleMutation.mutate({ userId, role: newRole }); // Fixed: changed newRole to role
  };
  
  if (error) {
    console.error("UserManagement: Error in component", error);
    return <div className="text-red-500">Error loading users: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      
      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          onClick={() => setFilter("all")}
        >
          All Users
        </Button>
        <Button 
          variant={filter === "admin" ? "default" : "outline"} 
          onClick={() => setFilter("admin")}
        >
          Admins
        </Button>
        <Button 
          variant={filter === "trainee" ? "default" : "outline"} 
          onClick={() => setFilter("trainee")}
        >
          Trainees
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.role === "admin" ? "bg-purple-600" : "bg-blue-600"}>
                        {user.role || "No Role"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, "admin")}
                          disabled={user.role === "admin"}
                        >
                          Make Admin
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, "trainee")}
                          disabled={user.role === "trainee"}
                        >
                          Make Trainee
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
