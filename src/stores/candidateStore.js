import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

const useCandidateStore = create(
  devtools(
    persist((set, get) => ({
      candidates: [],
      filteredCandidates: [],
      selectedCandidate: null,
      timeline: [],
      loading: false,
      error: null,
      searchTerm: "",
      stageFilter: "all",

      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setStageFilter: (stageFilter) => set({ stageFilter }),

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

      loadCandidateTimeline: async (candidateId) => {
        try {
          const response = await axios.get(
            `/api/candidates/${candidateId}/timeline`
          );
          const timelineData = response.data.data || [];

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

      createTimelineEvent: async (
        candidateId,
        eventType,
        description = null
      ) => {
        try {
          console.log("Creating timeline event:", candidateId, eventType);
          const existingEventsResponse = await axios.get(
            `/api/candidates/${candidateId}/timeline`
          );

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

      moveCandidate: async (candidateId, newStage) => {
        const { candidates, selectedCandidate, searchTerm, stageFilter } = get();
        const originalCandidates = [...candidates];
        const originalSelectedCandidate = selectedCandidate;
        const currentCandidate = candidates.find((c) => c.id === candidateId);
        const oldStage = currentCandidate?.stage;

        const stageLabels = {
          applied: "Applied",
          screen: "Screening",
          tech: "Technical Interview",
          offer: "Offer Extended",
          hired: "Hired",
          rejected: "Rejected",
        };

        // Optimistic update
        const updatedCandidates = candidates.map((c) =>
          c.id === candidateId
            ? { ...c, stage: newStage, updatedAt: new Date().toISOString() }
            : c
        );

        const updatedSelectedCandidate =
          selectedCandidate && selectedCandidate.id === candidateId
            ? {
                ...selectedCandidate,
                stage: newStage,
                updatedAt: new Date().toISOString(),
              }
            : selectedCandidate;

        // Apply filters to get updated filteredCandidates
        let filtered = [...updatedCandidates];
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

        set({
          candidates: updatedCandidates,
          selectedCandidate: updatedSelectedCandidate,
          filteredCandidates: filtered,
        });

        try {
          const response = await axios.patch(
            `/api/candidates/${candidateId}`,
            { stage: newStage },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          // Update with server response
          const finalCandidates = updatedCandidates.map((c) =>
            c.id === candidateId ? response.data.data : c
          );

          const finalSelectedCandidate =
            selectedCandidate && selectedCandidate.id === candidateId
              ? response.data.data
              : selectedCandidate;

          // Apply filters to get final filteredCandidates
          let finalFiltered = [...finalCandidates];
          if (searchTerm) {
            finalFiltered = finalFiltered.filter(
              (candidate) =>
                candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (stageFilter !== "all") {
            finalFiltered = finalFiltered.filter(
              (candidate) => candidate.stage === stageFilter
            );
          }

          set({
            candidates: finalCandidates,
            selectedCandidate: finalSelectedCandidate,
            filteredCandidates: finalFiltered,
          });

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
          // Revert to original state on error
          let revertedFiltered = [...originalCandidates];
          if (searchTerm) {
            revertedFiltered = revertedFiltered.filter(
              (candidate) =>
                candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (stageFilter !== "all") {
            revertedFiltered = revertedFiltered.filter(
              (candidate) => candidate.stage === stageFilter
            );
          }

          set({
            candidates: originalCandidates,
            selectedCandidate: originalSelectedCandidate,
            filteredCandidates: revertedFiltered,
            error: error.message,
          });
          throw error;
        }
      },

      addNoteToCandidate: async (candidateId, note) => {
        try {
          const noteWithTimestamp = {
            ...note,
            createdAt: new Date().toISOString(),
          };

          const response = await axios.post(
            `/api/candidates/${candidateId}/notes`,
            noteWithTimestamp,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

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
    })),
    { name: "candidate-store" }
  )
);

export default useCandidateStore;
