
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/hooks/useAuth";

type UserRoleActionsProps = {
  userId: string;
  currentRole: UserRole | null;
};

export const UserRoleActions = ({ userId, currentRole }: UserRoleActionsProps) => {
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      console.log("UserRoleActions: Updating role", { userId, role });
      
      // First check if the user has a role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is the code for "no rows returned"
        console.error("UserRoleActions: Error checking existing role", checkError);
        throw checkError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        
        if (error) {
          console.error("UserRoleActions: Error updating role", error);
          throw error;
        }
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        
        if (error) {
          console.error("UserRoleActions: Error inserting role", error);
          throw error;
        }
      }
      
      return { userId, role };
    },
    onSuccess: (data) => {
      console.log("UserRoleActions: Role updated successfully", data);
      toast.success(`User role updated to ${data.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      console.error("UserRoleActions: Mutation error", error);
      toast.error(`Failed to update role: ${(error as Error).message}`);
    }
  });

  const handleRoleChange = (newRole: UserRole) => {
    console.log("UserRoleActions: Handling role change", { userId, newRole });
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => handleRoleChange("admin")}
        disabled={currentRole === "admin"}
      >
        Make Admin
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => handleRoleChange("contributor")}
        disabled={currentRole === "contributor"}
      >
        Make Contributor
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => handleRoleChange("trainee")}
        disabled={currentRole === "trainee"}
      >
        Make Trainee
      </Button>
    </div>
  );
};
