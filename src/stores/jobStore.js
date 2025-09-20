import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {'active'|'archived'} status
 * @property {string[]} tags
 * @property {number} order
 * @property {string} [department]
 * @property {string} [location]
 * @property {string} [description]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const useJobStore = create(
  devtools(
    persist(
      (set, get) => ({
        // state
        jobs: [],
        filteredJobs: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        loading: false,
        error: null,
        searchTerm: "",
        statusFilter: "all",
        sortBy: "newest",

        // selected job
        selectedJob: null,
        selectedJobLoading: false,

        // optimistic update tracking - using object instead of Map for serialization
        optimisticUpdates: {},

        // actions
        setJobs: (jobs) => set({ jobs }),
        setFilteredJobs: (filteredJobs) => set({ filteredJobs }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setSearchTerm: (searchTerm) => {
          set({ searchTerm });
          get().filterJobs();
        },
        setStatusFilter: (statusFilter) => {
          set({ statusFilter });
          get().filterJobs();
        },
        setSortBy: (sortBy) => {
          set({ sortBy });
          get().filterJobs();
        },
        setPagination: (pagination) => set({ pagination }),

        // selected job helpers
        setSelectedJob: (job) => set({ selectedJob: job }),
        clearSelectedJob: () => set({ selectedJob: null }),

        // Load jobs from API (server-side pagination)
        loadJobs: async (
          page = 1,
          pageSize = 10,
          search = "",
          status = "all",
          sortBy = "newest"
        ) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.get("/api/jobs", {
              params: { page, pageSize, search, status, sort: sortBy },
            });

            const data = response.data;
            // normalize meta/data (support either shape)
            const meta = data?.meta ?? data?.pagination ?? {};
            const list = data?.data ?? data?.jobs ?? [];

            set({
              jobs: list,
              pagination: {
                page: meta.page ?? page,
                pageSize: meta.pageSize ?? pageSize,
                total: meta.total ?? list.length,
                totalPages:
                  meta.totalPages ??
                  Math.max(
                    1,
                    Math.ceil((meta.total ?? list.length) / pageSize)
                  ),
              },
              loading: false,
            });
            // local post-processing if you want to maintain filteredJobs
            get().filterJobs();
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
          }
        },

        // get single job (tries server, falls back to local job list)
        getJob: async (jobId) => {
          // only set selectedJobLoading, don't touch global `loading` so list UI isn't affected
          set({ selectedJobLoading: true, error: null });
          try {
            // attempt server fetch first (preferred)
            const response = await axios.get(`/api/jobs/${jobId}`);
            // support both { data: job } and { data: { data: job } } shapes
            const job = response.data?.data ?? response.data;
            set({ selectedJob: job, selectedJobLoading: false });
            return job;
          } catch (err) {
            // fallback: try local cache (jobs array)
            const local = get().jobs.find((j) => j.id === jobId);
            if (local) {
              set({ selectedJob: local, selectedJobLoading: false });
              return local;
            }

            // if no local result, propagate error
            set({
              error: err.response?.data?.message || err.message,
              selectedJobLoading: false,
            });
            throw err;
          }
        },

        // Toggle job status with optimistic updates
        toggleJobStatus: async (jobId, currentStatus) => {
          const { jobs, optimisticUpdates } = get();
          const newStatus = currentStatus === "active" ? "archived" : "active";

          // Store original state for rollback
          const originalJob = jobs.find((job) => job.id === jobId);
          if (!originalJob) return;

          // Use object instead of Map
          const newOptimisticUpdates = { ...optimisticUpdates };
          newOptimisticUpdates[jobId] = { ...originalJob };

          // Optimistic update
          const optimisticJobs = jobs.map((job) =>
            job.id === jobId ? { ...job, status: newStatus } : job
          );

          set({
            jobs: optimisticJobs,
            optimisticUpdates: newOptimisticUpdates,
          });
          get().filterJobs();

          try {
            // API call
            const response = await axios.patch(`/api/jobs/${jobId}`, {
              status: newStatus,
            });

            const updatedJob = response.data?.data ?? response.data;

            // Update with server response
            const serverJobs = jobs.map((job) =>
              job.id === jobId ? updatedJob : job
            );

            // Remove from optimistic updates
            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[jobId];

            set({
              jobs: serverJobs,
              optimisticUpdates: finalOptimisticUpdates,
            });
            get().filterJobs();

            return updatedJob;
          } catch (error) {
            // Rollback on failure
            const rollbackJob = newOptimisticUpdates[jobId];
            const rolledBackJobs = jobs.map((job) =>
              job.id === jobId ? rollbackJob : job
            );

            // Remove from optimistic updates
            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[jobId];

            set({
              jobs: rolledBackJobs,
              optimisticUpdates: finalOptimisticUpdates,
              error: error.response?.data?.message || error.message,
            });
            get().filterJobs();

            throw error;
          }
        },

        // Filter and sort jobs (local)
        filterJobs: () => {
          const { jobs, searchTerm, statusFilter, sortBy } = get();
          let filtered = [...jobs];

          if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(
              (job) =>
                (job.title || "").toLowerCase().includes(lower) ||
                (job.department || "").toLowerCase().includes(lower) ||
                (job.location || "").toLowerCase().includes(lower) ||
                (job.tags || []).some((tag) =>
                  (tag || "").toLowerCase().includes(lower)
                )
            );
          }

          if (statusFilter !== "all") {
            filtered = filtered.filter((job) => job.status === statusFilter);
          }

          filtered.sort((a, b) => {
            switch (sortBy) {
              case "newest":
                return new Date(b.createdAt) - new Date(a.createdAt);
              case "oldest":
                return new Date(a.createdAt) - new Date(b.createdAt);
              case "title":
                return (a.title || "").localeCompare(b.title || "");
              case "department":
                return (a.department || "").localeCompare(b.department || "");
              case "order":
                return (a.order || 0) - (b.order || 0);
              default:
                return 0;
            }
          });

          set({ filteredJobs: filtered });
        },

        // Create new job
        createJob: async (jobData) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.post("/api/jobs", jobData);
            const data = response.data;
            const newJob = data?.data ?? data;

            const { jobs } = get();
            set({ jobs: [newJob, ...jobs], loading: false });
            get().filterJobs();
            return newJob;
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Update job
        updateJob: async (id, updates) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.patch(`/api/jobs/${id}`, updates);
            const data = response.data;
            const updatedJob = data?.data ?? data;

            const { jobs } = get();
            const updatedJobs = jobs.map((job) =>
              job.id === id ? updatedJob : job
            );
            set({ jobs: updatedJobs, loading: false });
            get().filterJobs();
            return updatedJob;
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
            throw error;
          }
        },

        reorderJobs: async (activeId, overId) => {
          const { jobs, optimisticUpdates } = get();
          const oldJobs = [...jobs];

          // Get indexes
          const oldIndex = jobs.findIndex((job) => job.id === activeId);
          const newIndex = jobs.findIndex((job) => job.id === overId);

          if (oldIndex === -1 || newIndex === -1) return;

          // Create new array with reordered items using proper array manipulation
          const newJobs = [...jobs];
          const [movedJob] = newJobs.splice(oldIndex, 1);
          newJobs.splice(newIndex, 0, movedJob);

          // Update order values based on new positions
          const updatedJobs = newJobs.map((job, index) => ({
            ...job,
            order: index + 1,
          }));

          // Mark as pending for optimistic update (using object instead of Map)
          const newOptimisticUpdates = { ...optimisticUpdates };
          const originalJob = oldJobs.find((j) => j.id === activeId);
          if (originalJob) {
            newOptimisticUpdates[activeId] = originalJob;
          }

          set({
            jobs: updatedJobs,
            optimisticUpdates: newOptimisticUpdates,
          });
          get().filterJobs();

          try {
            // Call API to save order
            const response = await axios.post("/api/jobs/reorder", {
              jobId: activeId,
              beforeId: overId,
              newOrder: updatedJobs.find((j) => j.id === activeId)?.order,
            });

            if (response.status !== 200) {
              throw new Error("Failed to reorder jobs");
            }

            // Clear optimistic update on success
            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[activeId];

            set({ optimisticUpdates: finalOptimisticUpdates });
          } catch (error) {
            console.error("Reorder failed:", error);

            // Rollback to old state
            const rollbackOptimisticUpdates = { ...newOptimisticUpdates };
            delete rollbackOptimisticUpdates[activeId];

            set({
              jobs: oldJobs,
              optimisticUpdates: rollbackOptimisticUpdates,
              error: error.response?.data?.message || error.message,
            });
            get().filterJobs();
            throw error;
          }
        },

        reorderJob: async (id, fromOrder, toOrder) => {
          const { jobs } = get();
          const originalJobs = [...jobs];

          const updatedJobs = jobs.map((job) =>
            job.id === id ? { ...job, order: toOrder } : job
          );
          set({ jobs: updatedJobs });
          get().filterJobs();

          try {
            const response = await axios.patch(`/api/jobs/${id}/reorder`, {
              fromOrder,
              toOrder,
            });
            return response.data?.data ?? response.data;
          } catch (error) {
            set({ jobs: originalJobs, error: error.message });
            get().filterJobs();
            throw error;
          }
        },

        // Clear errors
        clearError: () => set({ error: null }),
      }),
      {
        name: "job-store",
        // Exclude optimisticUpdates from persistence since it's runtime state
        partialize: (state) => {
          const { optimisticUpdates, selectedJobLoading, ...persistedState } =
            state;
          return persistedState;
        },
        // Ensure optimisticUpdates is properly initialized when store is hydrated
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.optimisticUpdates = {};
            state.selectedJobLoading = false;
          }
        },
      }
    )
  )
);

export default useJobStore;
