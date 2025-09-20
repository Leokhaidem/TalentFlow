import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Calendar,
  MapPin,
  Briefcase,
  Archive,
  ArchiveRestore,
  Edit,
  Eye,
  Loader2,
  ExternalLink,
  FileText,
  ClipboardCheck,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useJobStore from "@/stores/jobStore";
import useAssessmentStore from "@/stores/assessmentStore";

export default function JobCard({
  job,
  onEdit,
  onView,
  onViewDetails,
  isDragDropEnabled = false,
  isDragOverlay = false,
}) {
  const navigate = useNavigate();
  const { toggleJobStatus, optimisticUpdates } = useJobStore();
  const { loadAssessment } = useAssessmentStore();
  const [stats, setStats] = useState({ total: 0, hired: 0, pending: 0 });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(true);

  // FIXED: Changed from Map.has() to object property check
  const hasPendingUpdate = job.id in optimisticUpdates;

  const getJobStats = async (jobId) => {
    try {
      const response = await fetch(
        `/api/candidates?jobId=${jobId}&pageSize=1000`
      );
      const data = await response.json();
      const candidates = data.data || [];

      return {
        total: candidates.length,
        hired: candidates.filter((c) => c.stage === "hired").length,
        pending: candidates.filter(
          (c) => !["hired", "rejected"].includes(c.stage)
        ).length,
      };
    } catch (error) {
      console.error("Failed to load job stats:", error);
      return { total: 0, hired: 0, pending: 0 };
    }
  };

  const checkAssessmentExists = async (jobId) => {
    setAssessmentLoading(true);
    try {
      const assessment = await loadAssessment(jobId);
      setHasAssessment(!!assessment);
    } catch (error) {
      // Assessment doesn't exist or failed to load
      setHasAssessment(false);
    } finally {
      setAssessmentLoading(false);
    }
  };

  useEffect(() => {
    getJobStats(job.id).then(setStats);
    checkAssessmentExists(job.id);
  }, [job.id]);

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    setIsUpdatingStatus(true);
    try {
      await toggleJobStatus(job.id, job.status);
    } catch (error) {
      console.error("Failed to toggle job status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCardClick = (e) => {
    // Prevent any default card click behavior
    // Only allow interactions through the dropdown menu
    e.preventDefault();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(job);
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    onView?.(job);
  };

  const handleViewJob = (e) => {
    e.stopPropagation();
    onViewDetails?.(job);
  };

  const handleManageAssessment = (e) => {
    e.stopPropagation();
    navigate(`/app/assessments/${job.id}`);
  };

  const handleTakeAssessment = (e) => {
    e.stopPropagation();
    navigate(`/app/assessments/${job.id}/take`);
  };

  // const handleViewCandidates = (e) => {
  //   e.stopPropagation();
  //   navigate(`/app/candidates?jobId=${job.id}`);
  // };

  return (
    <Card
      className={cn(
        "card-interactive transition-smooth group relative select-none",
        job.status === "archived" && "opacity-75",
        hasPendingUpdate && "ring-2 ring-blue-200 ring-opacity-50",
        isDragOverlay && "shadow-2xl scale-105 cursor-grabbing",
        isDragDropEnabled && "pl-8" // Add left padding for drag handle
      )}
      onClick={handleCardClick}
    >
      {hasPendingUpdate && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg text-foreground line-clamp-2">
                {job.title}
              </CardTitle>
              {!assessmentLoading && hasAssessment && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center space-x-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Assessment</span>
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center space-x-4 mt-2">
              <span className="flex items-center">
                <Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{job.department}</span>
              </span>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            </CardDescription>
          </div>

          {!isDragOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdatingStatus}
                  className="dropdown-trigger flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewClick}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewJob}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={handleViewCandidates}>
                  <Users className="w-4 h-4 mr-2" />
                  View Candidates ({stats.total})
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleManageAssessment}>
                  <FileText className="w-4 h-4 mr-2" />
                  {hasAssessment ? "Edit Assessment" : "Create Assessment"}
                </DropdownMenuItem>
                {hasAssessment && (
                  <DropdownMenuItem onClick={handleTakeAssessment}>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Test Assessment
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleStatusToggle}
                  disabled={isUpdatingStatus}
                >
                  {job.status === "active" ? (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Job
                    </>
                  ) : (
                    <>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Restore Job
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {job.tags &&
            job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          {job.tags && job.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{job.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {stats.total}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {stats.hired}
            </div>
            <div className="text-xs text-muted-foreground">Hired</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Assessment Status */}
        {!assessmentLoading && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Badge
                variant={job.status === "active" ? "default" : "secondary"}
                className={cn(
                  "pb-1",
                  job.status === "active" ? "gradient-primary text-white" : ""
                )}
              >
                {job.status}
                {hasPendingUpdate && (
                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                )}
              </Badge>

              {hasAssessment ? (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  <ClipboardCheck className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  No Assessment
                </Badge>
              )}
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {assessmentLoading && (
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge
              variant={job.status === "active" ? "default" : "secondary"}
              className={cn(
                "pb-1",
                job.status === "active" ? "gradient-primary text-white" : ""
              )}
            >
              {job.status}
              {hasPendingUpdate && (
                <Loader2 className="w-3 h-3 ml-1 animate-spin" />
              )}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        {!isDragOverlay && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageAssessment}
              className="text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              {hasAssessment ? "Edit" : "Create"} Assessment
            </Button>

            <Button
              variant="outline"
              size="sm"
              // onClick={handleViewCandidates}
              className="text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              Candidates ({stats.total})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}