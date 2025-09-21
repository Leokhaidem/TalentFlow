import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Search } from "lucide-react";
import useCandidateStore from "@/stores/candidateStore";

import CandidateCard from "@/components/candidates/CandidateCard";
import KanbanColumn from "@/components/candidates/KanbanColumn";
import NotesDialog from "@/components/candidates/NotesDialog";
import VirtualizedList from "@/components/candidates/VirtualizedList";
import AddCandidateDialog from "@/components/candidates/AddCandidateDialog";
import CandidateProfileDialog from "@/components/candidates/CandidateProfileDialog";

export default function Candidates() {
  const {
    filteredCandidates = [],
    loading,
    searchTerm,
    stageFilter,
    setSearchTerm,
    setStageFilter,
    loadCandidates,
    filterCandidates,
    moveCandidate,
    addNoteToCandidate,
  } = useCandidateStore();

  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [candidateForNotes, setCandidateForNotes] = useState(null);

  const stages = [
    { value: "applied", label: "Applied", color: "bg-blue-500" },
    { value: "screen", label: "Screening", color: "bg-yellow-500" },
    { value: "tech", label: "Technical", color: "bg-purple-500" },
    { value: "offer", label: "Offer", color: "bg-green-500" },
    { value: "hired", label: "Hired", color: "bg-emerald-600" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
  ];

  useEffect(() => {
    loadCandidates?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm?.(localSearch || ""), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    filterCandidates?.();
  }, [searchTerm, stageFilter, filterCandidates]);

  const handleDrop = async (candidate, newStage) => {
    console.log("handleDrop called with candidate:", candidate?.name, "to stage:", newStage);
    console.log("Current filteredCandidates count:", filteredCandidates?.length);
    if (candidate.stage !== newStage) {
      try {
        console.log("Moving candidate from", candidate.stage, "to", newStage);
        await moveCandidate?.(candidate.id, newStage);
        console.log("Candidate moved successfully");
        console.log("Updated filteredCandidates count:", filteredCandidates?.length);
      } catch (err) {
        console.error("moveCandidate failed:", err);
      }
    } else {
      console.log("No move needed - same stage");
    }
  };

  const handleAddNote = (candidate) => {
    setCandidateForNotes(candidate);
    setNotesDialogOpen(true);
  };

  const handleSaveNote = (candidateId, note) => {
    addNoteToCandidate?.(candidateId, note);
  };

  // Sort candidates by updatedAt (most recently updated first)
  const sortCandidatesByUpdate = (candidates) => {
    return [...candidates].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA; // Most recent first
    });
  };

  const candidatesByStage = stages.reduce((acc, stage) => {
    const stageCandidates = (filteredCandidates || []).filter(
      (c) => c.stage === stage.value
    );
    // Sort each stage's candidates by most recently updated
    acc[stage.value] = sortCandidatesByUpdate(stageCandidates);
    return acc;
  }, {});

  const renderCandidateItem = (candidate) => (
    <CandidateCard
      key={candidate.id}
      candidate={candidate}
      onDragStart={() => {}} // No drag functionality needed in list view
      onViewProfile={(c) => setSelectedCandidate(c)}
      onAddNote={handleAddNote}
    />
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground">
            Manage candidate applications with Kanban board
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <AddCandidateDialog />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <Select
              value={stageFilter}
              onValueChange={(v) => setStageFilter?.(v)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(filteredCandidates || []).length} candidates
        </p>
      </div>

      {/* Board / List */}
      {viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4 h-[calc(100vh-300px)]">
          <div className="flex space-x-4 min-w-max ">
            {stages.map((stage) => (
              <KanbanColumn
                key={stage.value}
                title={stage.label}
                stage={stage.value}
                candidates={candidatesByStage[stage.value] || []}
                onDrop={handleDrop}
                onViewProfile={(c) => setSelectedCandidate(c)}
                onAddNote={handleAddNote}
                color={stage.color}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            {(filteredCandidates || []).length > 0 ? (
              <VirtualizedList
                items={sortCandidatesByUpdate(filteredCandidates)}
                renderItem={renderCandidateItem}
                containerHeight={600}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No candidates found
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || stageFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first candidate to get started"}
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Candidate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Dialog */}
      <NotesDialog
        candidate={candidateForNotes}
        isOpen={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        onSaveNote={handleSaveNote}
      />
      {/* Profile Dialog */}
      <CandidateProfileDialog
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
