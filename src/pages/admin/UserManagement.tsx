
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUserManagement } from "@/hooks/admin/useUserManagement";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";

const UserManagement = () => {
  const navigate = useNavigate();
  const { users, isLoading, error, filter, setFilter } = useUserManagement();
  
  const handleBackToAdmin = () => {
    console.log("UserManagement: Navigating back to admin panel");
    navigate("/admin");
  };

  if (error) {
    console.error("UserManagement: Error in component", error);
    return <div className="text-red-500">Error loading users: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button 
          variant="outline" 
          onClick={handleBackToAdmin}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Panel
        </Button>
      </div>
      
      <UserFilters activeFilter={filter} onFilterChange={setFilter} />
      <UsersTable users={users} isLoading={isLoading} />
    </div>
  );
};

export default UserManagement;
