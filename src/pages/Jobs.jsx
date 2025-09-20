import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Plus, Search, Filter, Briefcase, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import useJobStore from "@/stores/jobStore";
import JobCard from "@/components/jobs/JobCard";
import SortableJobCard from "@/components/jobs/SortableJobCard";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import JobsPagination from "@/components/jobs/JobsPagination";
import { useDebounce } from "@/hooks/use-debounce";

export default function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    jobs,
    loading,
    error,
    pagination,
    selectedJob,
    loadJobs,
    getJob,
    clearSelectedJob,
    reorderJobs,
    clearError,
  } = useJobStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get("page") || "1")
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Drag and drop state
  const [activeJob, setActiveJob] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for more responsive dragging
        delay: 50, // Small delay to distinguish from clicks
        tolerance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load jobs when filters change
  useEffect(() => {
    loadJobs(currentPage, 10, debouncedSearchTerm, statusFilter, sortBy);
  }, [currentPage, debouncedSearchTerm, statusFilter, sortBy, loadJobs]);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage !== 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [debouncedSearchTerm, statusFilter, sortBy, currentPage, setSearchParams]);

  // Clear error when component mounts or when filters change
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadJobs(page, 10, debouncedSearchTerm, statusFilter, sortBy);
  };

  const handleCreateJob = () => {
    setJobToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setIsCreateModalOpen(true);
  };

  // Updated: Handle quick view (modal)
  const handleQuickViewJob = async (job) => {
    const fetched = await getJob(job.id);
    if (fetched) {
      useJobStore.setState({ selectedJob: job });
      setIsDetailModalOpen(true);
    }
  };

  // New: Handle view details (navigate to detail page)
  const handleViewJobDetails = (job) => {
    navigate(`/app/jobs/${job.id}`);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setJobToEdit(null);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) {
      setActiveJob(job);
      setIsDragging(true);
      console.log("[v0] Drag started for job:", job.title);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    console.log("[v0] Drag ended - Active:", active?.id, "Over:", over?.id);

    setActiveJob(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      console.log("[v0] No valid drop target or same position");
      return;
    }

    try {
      console.log("[v0] Attempting to reorder jobs");

      // Find the indices of the active and over items
      const activeIndex = jobs.findIndex((job) => job.id === active.id);
      const overIndex = jobs.findIndex((job) => job.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Calculate new order based on grid position
        const activeJob = jobs[activeIndex];
        const overJob = jobs[overIndex];

        // Use the over job's order as the new position
        await reorderJobs(active.id, over.id, overJob.order);
        console.log("[v0] Jobs reordered successfully");
      }
    } catch (error) {
      console.error("[v0] Failed to reorder jobs:", error);
    }
  };

  const handleDragCancel = () => {
    console.log("[v0] Drag cancelled");
    setActiveJob(null);
    setIsDragging(false);
  };

  // Check if drag and drop should be enabled
  const isDragDropEnabled =
    sortBy === "order" && !searchTerm && statusFilter === "all";

  if (loading && jobs.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="text-muted-foreground">
              Manage your job postings and requirements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings and requirements
          </p>
        </div>
        <Button
          onClick={handleCreateJob}
          className="gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-destructive font-medium">
                Error: {error}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-auto bg-transparent"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, department, or tags..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="order">Custom Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDragDropEnabled && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <GripVertical className="w-4 h-4" />
                <span>
                  Drag and drop enabled - Hover over cards to see drag handles
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {pagination?.total} jobs{" "}
          {searchTerm && `(for "${searchTerm}")`}
        </p>
      </div>

      {/* Jobs Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={jobs.map((job) => job.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
              isDragging ? "select-none" : ""
            }`}
          >
            {jobs.map((job) =>
              isDragDropEnabled ? (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onView={handleQuickViewJob}
                  onViewDetails={handleViewJobDetails}
                />
              ) : (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onView={handleQuickViewJob}
                  onViewDetails={handleViewJobDetails}
                />
              )
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeJob ? (
            <div className="shadow-2xl scale-105 rotate-2 opacity-95">
              <JobCard job={activeJob} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <JobsPagination
          currentPage={pagination?.page}
          totalPages={pagination?.totalPages}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      )}

      {/* Empty State */}
      {jobs.length === 0 && !loading && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first job posting to get started"}
            </p>
            <Button
              onClick={handleCreateJob}
              className="gradient-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        jobToEdit={jobToEdit}
      />

      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          clearSelectedJob();
        }}
        onEdit={handleEditJob}
      />
    </div>
  );
}
