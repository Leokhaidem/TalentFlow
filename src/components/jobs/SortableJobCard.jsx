import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import JobCard from "./JobCard"

export default function SortableJobCard({ job, onEdit, onView, onViewDetails }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    // Add data for better collision detection
    data: {
      type: "job",
      job,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 z-20 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing bg-background/90 backdrop-blur-sm border shadow-md hover:bg-accent hover:shadow-lg"
        data-drag-handle
        style={{ touchAction: "none" }} // Prevent scrolling on touch devices
      >
        <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      </div>

      {/* Job Card - Normal interactions */}
      <JobCard
        job={job}
        onEdit={onEdit}
        onView={onView}
        onViewDetails={onViewDetails}
        isDragDropEnabled={true}
        className={isDragging ? "cursor-grabbing shadow-lg" : ""}
      />
    </div>
  )
}
