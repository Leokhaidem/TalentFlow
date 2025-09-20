import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  Users,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobDetailModal({ job, isOpen, onClose, onEdit }) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between ">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{job.title}</DialogTitle>
              <DialogDescription className="flex items-center space-x-4 text-base">
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
              </DialogDescription>
            </div>
            <Badge
              variant={job.status === "active" ? "default" : "secondary"}
              className={cn(
                "ml-4 mt-2 mr-3 pb-1",
                job.status === "active" ? "gradient-primary text-white" : "",
                
              )}
            >
              {job.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium mb-3">Job Description</h4>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {job.description || "No description provided."}
            </div>
          </div>

          <Separator />

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Job Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="font-mono">{job.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-mono">{job.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    size="sm"
                    variant={job.status === "active" ? "default" : "secondary"}
                    className={"pb-1"}
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Dates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(job)}
              className="gradient-primary text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
