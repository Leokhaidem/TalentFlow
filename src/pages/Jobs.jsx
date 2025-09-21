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
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  GripVertical,
  ArrowUpDown,
} from "lucide-react";
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

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [customOrderEnabled, setCustomOrderEnabled] = useState(
    searchParams.get("sort") === "order"
  );
  const [hasLoadedCustomOrder, setHasLoadedCustomOrder] = useState(false);
  const [hasCustomOrderData, setHasCustomOrderData] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get("page") || "1")
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  const [activeJob, setActiveJob] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 50,
        tolerance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const effectiveSortBy = customOrderEnabled ? "order" : sortBy;
    loadJobs(
      currentPage,
      10,
      debouncedSearchTerm,
      statusFilter,
      effectiveSortBy
    );
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    loadJobs,
  ]);

  // Handle switching to custom order - preserve custom order data when toggling
  useEffect(() => {
    if (customOrderEnabled && !hasLoadedCustomOrder) {
      // Only reload when first enabling custom order AND we don't have custom order data yet
      loadJobs(currentPage, 10, debouncedSearchTerm, statusFilter, "order");
      setHasLoadedCustomOrder(true);
      setHasCustomOrderData(true);
    } else if (!customOrderEnabled && hasLoadedCustomOrder) {
      // When disabling custom order, just change the flag - don't reload
      setHasLoadedCustomOrder(false);
    } else if (customOrderEnabled && hasCustomOrderData) {
      // When re-enabling custom order and we already have custom order data, don't reload
      setHasLoadedCustomOrder(true);
    }
  }, [customOrderEnabled, hasLoadedCustomOrder, hasCustomOrderData, loadJobs, currentPage, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const effectiveSortBy = customOrderEnabled ? "order" : sortBy;
    if (effectiveSortBy !== "newest") params.set("sort", effectiveSortBy);
    if (currentPage !== 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    customOrderEnabled,
    currentPage,
    setSearchParams,
  ]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleCustomOrderToggle = () => {
    const newCustomOrderEnabled = !customOrderEnabled;
    setCustomOrderEnabled(newCustomOrderEnabled);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const effectiveSortBy = customOrderEnabled ? "order" : sortBy;
    loadJobs(page, 10, debouncedSearchTerm, statusFilter, effectiveSortBy);
  };

  const handleCreateJob = () => {
    setJobToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setIsCreateModalOpen(true);
  };

  const handleQuickViewJob = async (job) => {
    const fetched = await getJob(job.id);
    if (fetched) {
      useJobStore.setState({ selectedJob: job });
      setIsDetailModalOpen(true);
    }
  };

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
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveJob(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    try {
      const activeIndex = jobs.findIndex((job) => job.id === active.id);
      const overIndex = jobs.findIndex((job) => job.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Calculate the new position based on the drop position
        const newPosition = overIndex + 1; // +1 because order starts from 1
        console.log(`[Frontend] Moving job from position ${activeIndex + 1} to position ${newPosition}`);
        await reorderJobs(active.id, over.id, newPosition);
        // Mark that we have custom order data after reordering
        setHasCustomOrderData(true);
      }
    } catch (error) {
      console.error("Failed to reorder jobs:", error);
    }
  };

  const handleDragCancel = () => {
    setActiveJob(null);
    setIsDragging(false);
  };

  const isDragDropEnabled =
    customOrderEnabled && !searchTerm && statusFilter === "all";
  const canEnableCustomOrder = !searchTerm && statusFilter === "all";

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

            <Select
              value={sortBy}
              onValueChange={handleSortChange}
              disabled={customOrderEnabled}
            >
              <SelectTrigger
                className={`w-full sm:w-48 ${
                  customOrderEnabled ? "opacity-50" : ""
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={customOrderEnabled ? "default" : "outline"}
              onClick={handleCustomOrderToggle}
              disabled={!canEnableCustomOrder}
              className={`w-full sm:w-auto ${
                customOrderEnabled
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              } ${
                !canEnableCustomOrder ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={
                !canEnableCustomOrder
                  ? "Clear search and set status to 'All' to enable custom ordering"
                  : customOrderEnabled
                  ? "Disable custom ordering"
                  : "Enable drag & drop ordering"
              }
            >
              <GripVertical className="w-4 h-4 mr-2" />
              Custom Order
              {customOrderEnabled && (
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </Button>
          </div>

          {customOrderEnabled && isDragDropEnabled && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <GripVertical className="w-4 h-4" />
                <span>
                  Drag and drop enabled - Hover over cards to see drag handles
                </span>
              </div>
            </div>
          )}

          {customOrderEnabled && !isDragDropEnabled && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-amber-700">
                <ArrowUpDown className="w-4 h-4" />
                <span>
                  Custom ordering is enabled, but drag & drop requires clearing
                  search filters and showing all jobs
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {pagination?.total} jobs{" "}
          {searchTerm && `(for "${searchTerm}")`}
          {customOrderEnabled && " - Custom order enabled"}
        </p>
      </div>

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

      {pagination?.totalPages > 1 && (
        <JobsPagination
          currentPage={pagination?.page}
          totalPages={pagination?.totalPages}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      )}

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
