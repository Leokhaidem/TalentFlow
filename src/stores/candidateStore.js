import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

const useCandidateStore = create(
  devtools(
    persist((set, get) => ({
      // State
      candidates: [],
      filteredCandidates: [],
      selectedCandidate: null,
      timeline: [],
      loading: false,
      error: null,
      searchTerm: "",
      stageFilter: "all",

      // Actions
      setCandidates: (candidates) => set({ candidates }),
      setFilteredCandidates: (filteredCandidates) =>
        set({ filteredCandidates }),
      setSelectedCandidate: (selectedCandidate) => set({ selectedCandidate }),
      setTimeline: (timeline) => set({ timeline }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setStageFilter: (stageFilter) => set({ stageFilter }),

      // Load single candidate by ID
      loadCandidate: async (candidateId) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`/api/candidates/${candidateId}`);
          console.log("response store", response.data);
          set({
            selectedCandidate: response.data.data,
            loading: false,
          });
          return response.data.data;
        } catch (error) {
          console.error("Failed to load candidate:", error);
          set({
            error: error.message,
            selectedCandidate: null,
            loading: false,
          });
          throw error;
        }
      },

      // Load candidates from API
      loadCandidates: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const { searchTerm, stageFilter } = get();
          const searchParams = new URLSearchParams({
            ...(params.search || searchTerm
              ? { search: params.search || searchTerm }
              : {}),
            ...(params.stage || (stageFilter !== "all" ? stageFilter : null)
              ? { stage: params.stage || stageFilter }
              : {}),
            ...(params.jobId ? { jobId: params.jobId } : {}),
          });

          const response = await axios.get(
            `/api/candidates?${searchParams.toString()}`
          );

          set({
            candidates: response.data.data,
            filteredCandidates: response.data.data,
            loading: false,
          });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Load candidate timeline
      loadCandidateTimeline: async (candidateId) => {
        try {
          const response = await axios.get(
            `/api/candidates/${candidateId}/timeline`
          );
          const timelineData = response.data.data || [];

          // Sort timeline by date (newest first)
          const sortedTimeline = timelineData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          set({ timeline: sortedTimeline });
          console.log("Timeline loaded:", sortedTimeline);
          return sortedTimeline;
        } catch (error) {
          console.error("Failed to load timeline:", error);
          set({ error: error.message, timeline: [] });
          return [];
        }
      },

      // Alias for loadCandidateTimeline (for consistency)
      getTimeline: async (candidateId) => {
        return get().loadCandidateTimeline(candidateId);
      },

      // Create timeline event
      createTimelineEvent: async (
        candidateId,
        eventType,
        description = null
      ) => {
        try {
          console.log("Creating timeline event:", candidateId, eventType);

          // Check for duplicate events
          const existingEventsResponse = await axios.get(
            `/api/candidates/${candidateId}/timeline`
          );

          // Skip if same eventType already exists for this candidate
          const duplicate = existingEventsResponse.data.data?.find(
            (e) => e.type === eventType
          );
          if (duplicate) {
            console.log("Duplicate timeline event found, skipping");
            return duplicate;
          }

          const timelineEvent = {
            id: `timeline-${Date.now()}`,
            candidateId,
            type: eventType,
            description,
            createdAt: new Date().toISOString(),
          };

          const response = await axios.post(
            `/api/candidates/${candidateId}/timeline`,
            timelineEvent,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          console.log("Timeline event created:", response.data.data);
          return response.data.data;
        } catch (error) {
          console.error("Failed to create timeline event:", error);
          throw error;
        }
      },

      // Create new candidate
      createCandidate: async (candidateData) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/candidates", candidateData, {
            headers: { "Content-Type": "application/json" },
          });

          const { candidates } = get();
          const newCandidates = [response.data.data, ...candidates];

          set({
            candidates: newCandidates,
            loading: false,
          });

          get().filterCandidates();

          // Create timeline event for new candidate
          try {
            await get().createTimelineEvent(
              response.data.data.id,
              "Application Submitted",
              "Initial application submitted"
            );
          } catch (timelineError) {
            console.error(
              "Failed to create application timeline event:",
              timelineError
            );
          }

          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Update candidate
      updateCandidate: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.patch(`/api/candidates/${id}`, updates, {
            headers: { "Content-Type": "application/json" },
          });

          const { candidates } = get();

          const updatedCandidates = candidates.map((candidate) =>
            candidate.id === id ? response.data.data : candidate
          );

          set({
            candidates: updatedCandidates,
            loading: false,
          });

          // Update selected candidate if it's the one being updated
          const { selectedCandidate } = get();
          if (selectedCandidate && selectedCandidate.id === id) {
            set({ selectedCandidate: response.data.data });
          }

          get().filterCandidates();

          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Move candidate (optimistic update)
      moveCandidate: async (candidateId, newStage) => {
        const { candidates, selectedCandidate } = get();
        const originalCandidates = [...candidates];
        const originalSelectedCandidate = selectedCandidate;
        const currentCandidate = candidates.find((c) => c.id === candidateId);
        const oldStage = currentCandidate?.stage;

        // Stage labels for timeline
        const stageLabels = {
          applied: "Applied",
          screen: "Screening",
          tech: "Technical Interview",
          offer: "Offer Extended",
          hired: "Hired",
          rejected: "Rejected",
        };

        // Optimistic update for candidates list
        const updatedCandidates = candidates.map((c) =>
          c.id === candidateId
            ? { ...c, stage: newStage, updatedAt: new Date().toISOString() }
            : c
        );

        // Optimistic update for selected candidate if it matches
        const updatedSelectedCandidate =
          selectedCandidate && selectedCandidate.id === candidateId
            ? {
                ...selectedCandidate,
                stage: newStage,
                updatedAt: new Date().toISOString(),
              }
            : selectedCandidate;

        set({
          candidates: updatedCandidates,
          selectedCandidate: updatedSelectedCandidate,
        });
        get().filterCandidates();

        try {
          const response = await axios.patch(
            `/api/candidates/${candidateId}`,
            { stage: newStage },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const finalCandidates = candidates.map((c) =>
            c.id === candidateId ? response.data.data : c
          );

          const finalSelectedCandidate =
            selectedCandidate && selectedCandidate.id === candidateId
              ? response.data.data
              : selectedCandidate;

          set({
            candidates: finalCandidates,
            selectedCandidate: finalSelectedCandidate,
          });
          get().filterCandidates();

          // Create timeline event for stage change
          if (oldStage !== response.data.data.stage) {
            try {
              await get().createTimelineEvent(
                candidateId,
                `Stage Changed to ${stageLabels[newStage]}`,
                `Moved from ${stageLabels[oldStage]} to ${stageLabels[newStage]}`
              );
            } catch (timelineError) {
              console.error(
                "Failed to create stage change timeline event:",
                timelineError
              );
            }
          }

          return response.data.data;
        } catch (error) {
          // Rollback on failure
          set({
            candidates: originalCandidates,
            selectedCandidate: originalSelectedCandidate,
            error: error.message,
          });
          get().filterCandidates();
          throw error;
        }
      },

      // Add note
      addNoteToCandidate: async (candidateId, note) => {
        try {
          const noteWithTimestamp = {
            ...note,
            createdAt: new Date().toISOString(),
          };

          // Add note via API
          const response = await axios.post(
            `/api/candidates/${candidateId}/notes`,
            noteWithTimestamp,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          // Update local state
          set((state) => {
            const updatedCandidates = state.candidates.map((candidate) =>
              candidate.id === candidateId
                ? {
                    ...candidate,
                    notes: [...(candidate.notes || []), response.data.data],
                    updatedAt: new Date().toISOString(),
                  }
                : candidate
            );

            // Update selected candidate if it matches
            const updatedSelectedCandidate =
              state.selectedCandidate &&
              state.selectedCandidate.id === candidateId
                ? {
                    ...state.selectedCandidate,
                    notes: [
                      ...(state.selectedCandidate.notes || []),
                      response.data.data,
                    ],
                    updatedAt: new Date().toISOString(),
                  }
                : state.selectedCandidate;

            const { searchTerm, stageFilter } = state;
            let filtered = [...updatedCandidates];

            if (searchTerm) {
              filtered = filtered.filter(
                (candidate) =>
                  candidate.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  candidate.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              );
            }

            if (stageFilter !== "all") {
              filtered = filtered.filter(
                (candidate) => candidate.stage === stageFilter
              );
            }

            return {
              candidates: updatedCandidates,
              selectedCandidate: updatedSelectedCandidate,
              filteredCandidates: filtered,
            };
          });

          // Create timeline event for note addition
          try {
            await get().createTimelineEvent(
              candidateId,
              "Note Added",
              `Note: ${note.content.substring(0, 100)}${
                note.content.length > 100 ? "..." : ""
              }`
            );
          } catch (timelineError) {
            console.error(
              "Failed to create note timeline event:",
              timelineError
            );
          }

          return response.data.data;
        } catch (error) {
          console.error("Failed to add note:", error);
          throw error;
        }
      },

      // Filter candidates locally
      filterCandidates: () => {
        const { candidates, searchTerm, stageFilter } = get();
        let filtered = [...(candidates || [])];

        if (searchTerm) {
          filtered = filtered.filter(
            (candidate) =>
              candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (stageFilter !== "all") {
          filtered = filtered.filter(
            (candidate) => candidate.stage === stageFilter
          );
        }

        set({ filteredCandidates: filtered });
      },

      // Delete candidate
      deleteCandidate: async (candidateId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(`/api/candidates/${candidateId}`);

          const { candidates } = get();
          const updatedCandidates = candidates.filter(
            (c) => c.id !== candidateId
          );

          set({
            candidates: updatedCandidates,
            loading: false,
            selectedCandidate: null, // Clear selected candidate if it was deleted
          });

          get().filterCandidates();
          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Clear selected candidate
      clearSelectedCandidate: () => {
        set({ selectedCandidate: null, timeline: [] });
      },

      // Reset store to initial state
      resetStore: () => {
        set({
          candidates: [],
          filteredCandidates: [],
          selectedCandidate: null,
          timeline: [],
          loading: false,
          error: null,
          searchTerm: "",
          stageFilter: "all",
        });
      },
    })),
    { name: "candidate-store" }
  )
);

export default useCandidateStore;
