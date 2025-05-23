
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UserRole } from "@/hooks/useAuth";
import { UserRoleActions } from "./UserRoleActions";

export interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
}

interface UsersTableProps {
  users: UserWithRole[] | undefined;
  isLoading: boolean;
}

export const UsersTable = ({ users, isLoading }: UsersTableProps) => {
  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
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
                  <Badge 
                    className={
                      user.role === "admin" 
                        ? "bg-purple-600" 
                        : user.role === "contributor" 
                          ? "bg-green-600" 
                          : "bg-blue-600"
                    }
                  >
                    {user.role || "No Role"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <UserRoleActions userId={user.id} currentRole={user.role} />
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
  );
};
