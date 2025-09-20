import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
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
  Plus,
  Edit3,
  Download,
  MapPin,
} from "lucide-react";
import useCandidateStore from "@/stores/candidateStore";

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const id = candidateId;
  console.log("inside candidate profile", id);
  const navigate = useNavigate();
  const {
    selectedCandidate,
    timeline,
    loadCandidate,
    loadCandidateTimeline,
    addNoteToCandidate,
    moveCandidate,
  } = useCandidateStore();

  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        await loadCandidate(id);
        console.log("selected candidate", selectedCandidate);
        setTimelineLoading(true);
        await loadCandidateTimeline(id);
        setTimelineLoading(false);
      } catch (error) {
        console.error("Failed to load candidate data:", error);
        setTimelineLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id, loadCandidate, loadCandidateTimeline]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCandidate) return;

    setAddingNote(true);
    try {
      await addNoteToCandidate(selectedCandidate.id, {
        content: newNote,
        author: "Current User",
      });
      setNewNote("");
      setShowAddNote(false);
      // Reload timeline to show the new note
      setTimelineLoading(true);
      await loadCandidateTimeline(selectedCandidate.id);
      setTimelineLoading(false);
    } catch (error) {
      console.error("Failed to add note:", error);
      setTimelineLoading(false);
    } finally {
      setAddingNote(false);
    }
  };

  const handleStageChange = async (newStage) => {
    if (!selectedCandidate) return;

    try {
      await moveCandidate(selectedCandidate.id, newStage);
      setTimelineLoading(true);
      await loadCandidateTimeline(selectedCandidate.id);
      setTimelineLoading(false);
    } catch (error) {
      console.error("Failed to update stage:", error);
      setTimelineLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-6 h-6 animate-spin" />
            <span>Loading candidate profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCandidate) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The candidate profile you're looking for could not be found.
          </p>
          <Button onClick={() => navigate("/app/candidates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  const getStageColor = (stage) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      screen:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      tech: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      offer:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      hired:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[stage] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    );
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

  const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/candidates")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8" />
              {selectedCandidate.name}
            </h1>
            <p className="text-muted-foreground">
              Candidate ID: {selectedCandidate.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={getStageColor(selectedCandidate.stage)}>
            {selectedCandidate.stage.charAt(0).toUpperCase() +
              selectedCandidate.stage.slice(1)}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowAddNote(!showAddNote)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Candidate Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>

              {selectedCandidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCandidate.phone}
                    </p>
                  </div>
                </div>
              )}

              {selectedCandidate.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCandidate.location}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCandidate.jobId && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Job ID</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCandidate.jobId}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Applied On</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimelineDate(selectedCandidate.createdAt)}
                  </p>
                </div>
              </div>

              {selectedCandidate.resumeUrl && (
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Resume</p>
                    <a
                      href={selectedCandidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      View Resume
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stage Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Update Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {stages.map((stage) => (
                  <Button
                    key={stage}
                    variant={
                      selectedCandidate.stage === stage ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStageChange(stage)}
                    disabled={selectedCandidate.stage === stage}
                    className="text-xs"
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Note Section */}
          {showAddNote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your note about this candidate..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                  >
                    {addingNote ? "Adding..." : "Add Note"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddNote(false);
                      setNewNote("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Complete Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Loading timeline...</span>
                  </div>
                </div>
              ) : timeline && timeline.length > 0 ? (
                <div className="space-y-6">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary">
                          {getTimelineIcon(event.type)}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-px h-12 bg-border mt-2" />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-muted/30 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-foreground">
                              {event.type}
                            </h4>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatTimelineDate(event.createdAt)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mb-4" />
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

          {/* All Notes */}
          {selectedCandidate.notes && selectedCandidate.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Notes ({selectedCandidate.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCandidate.notes.map((note, index) => (
                    <div
                      key={note.id || index}
                      className="bg-muted/30 rounded-lg p-4 border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {note.author || "System"}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimelineDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
