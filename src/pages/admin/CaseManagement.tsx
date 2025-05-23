import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
import { Edit, Plus, Trash, ArrowLeft } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/sonner";

type BaseCase = Database["public"]["Tables"]["cases"]["Row"];

type Case = BaseCase & {
  creator?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const CaseManagement = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    console.log("CaseManagement: Component mounted with filter:", filter);
  }, [filter]);
  
  const { data: cases, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-cases", filter],
    queryFn: async () => {
      console.log("CaseManagement: Fetching cases with filter:", filter);
      
      let query = supabase
        .from("cases")
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `);
      
      if (filter === "published") {
        query = query.eq("published", true);
      } else if (filter === "unpublished") {
        query = query.eq("published", false);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("CaseManagement: Error fetching cases", error);
        throw error;
      }
      
      console.log("CaseManagement: Cases fetched successfully", { count: data?.length });
      
      // Transform the data to handle the creator relationship properly
      const transformedData = data?.map(caseItem => ({
        ...caseItem,
        creator: Array.isArray(caseItem.creator) 
          ? (caseItem.creator[0] || null)
          : caseItem.creator
      })) || [];
      
      return transformedData as Case[];
    }
  });
  
  const handleDeleteCase = async (id: string) => {
    console.log("CaseManagement: Attempting to delete case", { id });
    
    if (!window.confirm("Are you sure you want to delete this case?")) {
      console.log("CaseManagement: Delete cancelled by user");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("CaseManagement: Error deleting case", error);
        toast.error("Failed to delete case: " + error.message);
        return;
      }
      
      console.log("CaseManagement: Case deleted successfully", { id });
      toast.success("Case deleted successfully");
      refetch();
    } catch (error) {
      console.error("CaseManagement: Unexpected error during delete", error);
      toast.error("An unexpected error occurred");
    }
  };
  
  const handleCreateCase = () => {
    console.log("CaseManagement: Navigating to create case page");
    navigate("/admin/cases/new");
  };
  
  const handleEditCase = (id: string) => {
    console.log("CaseManagement: Navigating to edit case page", { id });
    navigate(`/admin/cases/edit/${id}`);
  };

  const getCreatorName = (creator: Case["creator"]) => {
    if (!creator) return "System";
    
    const { first_name, last_name } = creator;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    if (first_name) return first_name;
    if (last_name) return last_name;
    return "Unknown";
  };
  
  if (error) {
    console.error("CaseManagement: Error in component", error);
    return <div className="text-red-500">Error loading cases: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log("CaseManagement: Navigating back to admin dashboard");
              navigate("/admin");
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Cases Management</h1>
        </div>
        <Button onClick={handleCreateCase}>
          <Plus className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={filter === "published" ? "default" : "outline"} 
          onClick={() => setFilter("published")}
        >
          Published
        </Button>
        <Button 
          variant={filter === "unpublished" ? "default" : "outline"} 
          onClick={() => setFilter("unpublished")}
        >
          Unpublished
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading cases...</div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases && cases.length > 0 ? (
                cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.title}</TableCell>
                    <TableCell>{caseItem.region}</TableCell>
                    <TableCell>{caseItem.difficulty}</TableCell>
                    <TableCell>
                      {caseItem.published ? (
                        <Badge className="bg-green-600">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getCreatorName(caseItem.creator)}</TableCell>
                    <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleEditCase(caseItem.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive"
                          onClick={() => handleDeleteCase(caseItem.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No cases found
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

export default CaseManagement;
