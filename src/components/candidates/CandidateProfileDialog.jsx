import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import useCandidateStore from "@/stores/candidateStore";

export default function CandidateProfileDialog({ candidate, isOpen, onClose }) {
  const navigate = useNavigate();
  const { timeline, loadCandidateTimeline } = useCandidateStore();
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    if (!candidate?.id || !isOpen) {
      return;
    }

    const fetchTimeline = async () => {
      setTimelineLoading(true);
      try {
        await loadCandidateTimeline(candidate.id);
      } catch (error) {
        console.error("Failed to load timeline:", error);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, [candidate?.id, isOpen, loadCandidateTimeline]);

  const handleViewMore = () => {
    onClose();
    console.log(candidate.id)
    navigate(`/app/candidates/${candidate.id}`);
  };

  if (!candidate) return null;

  const getStageColor = (stage) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      screen: "bg-yellow-100 text-yellow-800",
      tech: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getTimelineIcon = (eventType) => {
    if (eventType.includes("Application")) return <User className="w-4 h-4" />;
    if (eventType.includes("Stage")) return <CheckCircle className="w-4 h-4" />;
    if (eventType.includes("Note")) return <FileText className="w-4 h-4" />;
    if (eventType.includes("Hired")) return <UserCheck className="w-4 h-4" />;
    if (eventType.includes("Rejected")) return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatTimelineDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show only first 3 timeline events in dialog
  const displayedTimeline = timeline?.slice(0, 3) || [];
  const hasMoreEvents = timeline && timeline.length > 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3">
                <User className="w-6 h-6" />
                {candidate.name}
              </DialogTitle>
              <DialogDescription>
                Candidate profile and application timeline
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleViewMore}
              className="flex items-center gap-2 m-4"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Profile
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Information Card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  {candidate.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Current Stage</p>
                      <Badge className={getStageColor(candidate.stage)}>
                        {candidate.stage.charAt(0).toUpperCase() +
                          candidate.stage.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {candidate.jobId && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Job ID</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.jobId}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Applied</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimelineDate(candidate.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {candidate.resumeUrl && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Resume</p>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline Section - Limited to 3 events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Recent Timeline</h3>
                </div>
                {hasMoreEvents && (
                  <Button variant="ghost" size="sm" onClick={handleViewMore}>
                    View All Events
                  </Button>
                )}
              </div>

              {timelineLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Loading timeline...</span>
                  </div>
                </div>
              ) : displayedTimeline.length > 0 ? (
                <div className="space-y-4">
                  {displayedTimeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                          {getTimelineIcon(event.type)}
                        </div>
                        {index < displayedTimeline.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground">
                              {event.type}
                            </h4>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatTimelineDate(event.createdAt)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMoreEvents && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={handleViewMore}>
                        View More Events ({timeline.length - 3} more)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">
                    No Timeline Events
                  </h4>
                  <p className="text-muted-foreground">
                    Timeline events will appear here as the candidate progresses
                    through the hiring process.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section - Limited to 2 notes */}
          {candidate.notes && candidate.notes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <h3 className="text-xl font-semibold">Recent Notes</h3>
                  </div>
                  {candidate.notes.length > 2 && (
                    <Button variant="ghost" size="sm" onClick={handleViewMore}>
                      View All Notes
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {candidate.notes.slice(0, 2).map((note, index) => (
                    <div
                      key={note.id || index}
                      className="bg-muted/50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {note.author || "System"}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimelineDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}

                  {candidate.notes.length > 2 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewMore}
                      >
                        View More Notes ({candidate.notes.length - 2} more)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
