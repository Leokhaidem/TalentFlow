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
        jobs: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        loading: false,
        error: null,
        searchTerm: "",
        statusFilter: "all",
        sortBy: "newest",

        selectedJob: null,
        selectedJobLoading: false,

        optimisticUpdates: {},

        setSelectedJob: (job) => set({ selectedJob: job }),
        clearSelectedJob: () => set({ selectedJob: null }),
        clearError: () => set({ error: null }),
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
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
          }
        },

        getJob: async (jobId) => {
          set({ selectedJobLoading: true, error: null });
          try {
            const response = await axios.get(`/api/jobs/${jobId}`);
            const job = response.data?.data ?? response.data;
            set({ selectedJob: job, selectedJobLoading: false });
            return job;
          } catch (err) {
            const local = get().jobs.find((j) => j.id === jobId);
            if (local) {
              set({ selectedJob: local, selectedJobLoading: false });
              return local;
            }
            set({
              error: err.response?.data?.message || err.message,
              selectedJobLoading: false,
            });
            throw err;
          }
        },

        toggleJobStatus: async (jobId, currentStatus) => {
          const { jobs, optimisticUpdates } = get();
          const newStatus = currentStatus === "active" ? "archived" : "active";

          const originalJob = jobs.find((job) => job.id === jobId);
          if (!originalJob) return;

          const newOptimisticUpdates = { ...optimisticUpdates };
          newOptimisticUpdates[jobId] = { ...originalJob };
          const optimisticJobs = jobs.map((job) =>
            job.id === jobId ? { ...job, status: newStatus } : job
          );

          set({
            jobs: optimisticJobs,
            optimisticUpdates: newOptimisticUpdates,
          });

          try {
            const response = await axios.patch(`/api/jobs/${jobId}`, {
              status: newStatus,
            });

            const updatedJob = response.data?.data ?? response.data;
            const serverJobs = jobs.map((job) =>
              job.id === jobId ? updatedJob : job
            );

            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[jobId];

            set({
              jobs: serverJobs,
              optimisticUpdates: finalOptimisticUpdates,
            });

            return updatedJob;
          } catch (error) {
            const rollbackJob = newOptimisticUpdates[jobId];
            const rolledBackJobs = jobs.map((job) =>
              job.id === jobId ? rollbackJob : job
            );

            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[jobId];

            set({
              jobs: rolledBackJobs,
              optimisticUpdates: finalOptimisticUpdates,
              error: error.response?.data?.message || error.message,
            });

            throw error;
          }
        },

        createJob: async (jobData) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.post("/api/jobs", jobData);
            const data = response.data;
            const newJob = data?.data ?? data;

            const { jobs } = get();
            set({ jobs: [newJob, ...jobs], loading: false });
            return newJob;
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
            throw error;
          }
        },

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

          const newJobs = [...jobs];
          const [movedJob] = newJobs.splice(oldIndex, 1);
          newJobs.splice(newIndex, 0, movedJob);
          const updatedJobs = newJobs.map((job, index) => ({
            ...job,
            order: index + 1,
          }));

          const newOptimisticUpdates = { ...optimisticUpdates };
          const originalJob = oldJobs.find((j) => j.id === activeId);
          if (originalJob) {
            newOptimisticUpdates[activeId] = originalJob;
          }

          set({
            jobs: updatedJobs,
            optimisticUpdates: newOptimisticUpdates,
          });

          try {
            const response = await axios.post("/api/jobs/reorder", {
              jobId: activeId,
              beforeId: overId,
              newOrder: updatedJobs.find((j) => j.id === activeId)?.order,
            });

            if (response.status !== 200) {
              throw new Error("Failed to reorder jobs");
            }

            const finalOptimisticUpdates = { ...newOptimisticUpdates };
            delete finalOptimisticUpdates[activeId];

            set({ optimisticUpdates: finalOptimisticUpdates });
          } catch (error) {
            console.error("Reorder failed:", error);

            const rollbackOptimisticUpdates = { ...newOptimisticUpdates };
            delete rollbackOptimisticUpdates[activeId];

            set({
              jobs: oldJobs,
              optimisticUpdates: rollbackOptimisticUpdates,
              error: error.response?.data?.message || error.message,
            });
            throw error;
          }
        },

      }),
      {
        name: "job-store",
        partialize: (state) => {
          const { optimisticUpdates, selectedJobLoading, ...persistedState } =
            state;
          return persistedState;
        },
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
