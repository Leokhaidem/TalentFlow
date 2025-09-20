import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useJobStore from "@/stores/jobStore";
import CreateJobModal from "@/components/jobs/CreateJobModal";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { selectedJob, getJob, loading, error } = useJobStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (jobId) {
      getJob(jobId);
    }
  }, [jobId, getJob]);
  

  const handleEditJob = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleBackToJobs = () => {
    navigate("/app/jobs");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToJobs}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
        <Card className="animate-pulse">
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToJobs}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error Loading Job
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleBackToJobs} variant="outline">
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToJobs}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBackToJobs} variant="outline">
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const job = selectedJob;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackToJobs}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditJob}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job Detail Card */}
      <Card className="card-elevated">
        <CardContent className="p-8">
          {/* Job Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {job.department}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge
              variant={job.status === "active" ? "default" : "secondary"}
              className={cn(
                "ml-4 text-sm px-3 py-1",
                job.status === "active" ? "gradient-primary text-white" : ""
              )}
            >
              {job.status}
            </Badge>
          </div>

          {/* Required Skills */}
          {job.tags && job.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="mb-6" />

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description || "No description provided."}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Job Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Job Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="font-mono text-sm">{job.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-mono text-sm">{job.slug}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    size="sm"
                    variant={job.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleBackToJobs}>
              Back to Jobs
            </Button>
            <Button
              onClick={handleEditJob}
              className="gradient-primary text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <CreateJobModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        jobToEdit={job}
      />
    </div>
  );
}
