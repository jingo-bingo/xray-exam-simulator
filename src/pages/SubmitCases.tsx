
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ReviewStatus = Database["public"]["Enums"]["review_status"];

const SubmitCases = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");

  // Fetch contributor's submitted cases
  const { data: cases, isLoading, error } = useQuery({
    queryKey: ["contributor-cases", user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log("SubmitCases: Fetching cases for contributor:", user.id);
      
      let query = supabase
        .from("cases")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("review_status", statusFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("SubmitCases: Error fetching cases:", error.message);
        throw new Error(error.message);
      }
      
      console.log("SubmitCases: Cases fetched successfully, count:", data?.length);
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Draft</Badge>;
      case "pending_review":
        return <Badge className="bg-yellow-600">Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-red-400 text-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canEdit = (status: string) => {
    return status === "draft" || status === "rejected";
  };

  if (isLoading) return <div className="text-center p-8">Loading your cases...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error loading cases: {(error as Error).message}</div>;

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-medical-primary">My Submitted Cases</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("SubmitCases: Contributor returning to dashboard");
                navigate("/dashboard");
              }}
              className="border-medical-border text-medical-primary hover:bg-medical-lighter"
            >
              Return to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-medical-dark">{user?.email} ({userRole})</span>
            <Button 
              variant="outline"
              onClick={signOut}
              className="border-medical-border hover:bg-medical-lighter"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"} 
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All Cases
            </Button>
            <Button 
              variant={statusFilter === "draft" ? "default" : "outline"} 
              onClick={() => setStatusFilter("draft")}
              size="sm"
            >
              Drafts
            </Button>
            <Button 
              variant={statusFilter === "pending_review" ? "default" : "outline"} 
              onClick={() => setStatusFilter("pending_review")}
              size="sm"
            >
              Pending Review
            </Button>
            <Button 
              variant={statusFilter === "approved" ? "default" : "outline"} 
              onClick={() => setStatusFilter("approved")}
              size="sm"
            >
              Approved
            </Button>
            <Button 
              variant={statusFilter === "rejected" ? "default" : "outline"} 
              onClick={() => setStatusFilter("rejected")}
              size="sm"
            >
              Rejected
            </Button>
          </div>
          
          <Button 
            onClick={() => navigate("/cases/submit/new")}
            className="bg-medical-primary hover:bg-medical-primary/90 text-white"
          >
            Submit New Case
          </Button>
        </div>

        {!cases || cases.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-medical-border shadow-sm">
            <h3 className="text-xl font-semibold text-medical-dark mb-2">No cases found</h3>
            <p className="text-medical-muted mb-4">
              {statusFilter === "all" 
                ? "You haven't submitted any cases yet." 
                : `You don't have any ${statusFilter.replace("_", " ")} cases.`
              }
            </p>
            <Button 
              onClick={() => navigate("/cases/submit/new")}
              className="bg-medical-primary hover:bg-medical-primary/90 text-white"
            >
              Submit Your First Case
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-medical-border overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-medical-lighter">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id} className="border-medical-border">
                    <TableCell className="font-medium">{caseItem.title}</TableCell>
                    <TableCell>{caseItem.region?.toUpperCase()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {caseItem.difficulty?.charAt(0).toUpperCase() + caseItem.difficulty?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(caseItem.review_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canEdit(caseItem.review_status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/cases/submit/edit/${caseItem.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/cases/${caseItem.id}`, { state: { from: 'submitted' } })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmitCases;
