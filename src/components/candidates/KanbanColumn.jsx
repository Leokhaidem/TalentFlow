import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import CandidateCard from "./CandidateCard";
import { cn } from "@/lib/utils";
import { useState } from "react";
export default function KanbanColumn({ title, stage, candidates, onDrop, onViewProfile, onAddNote, color }){
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const candidateData = JSON.parse(e.dataTransfer.getData("text/plain"));
      console.log("Drop event - candidate:", candidateData?.name, "from stage:", candidateData?.stage, "to stage:", stage);
      if (candidateData && candidateData.stage !== stage) {
        console.log("Calling onDrop with candidate:", candidateData.name, "to stage:", stage);
        onDrop?.(candidateData, stage);
      } else {
        console.log("Drop ignored - same stage or invalid data");
      }
    } catch (error) {
      console.error("Error parsing dropped data:", error);
    }
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[300px]">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn("w-3 h-3 rounded-full", color)} />
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {candidates.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "p-3 h-[calc(100%-80px)] transition-colors duration-200",
            isDragOver && "bg-blue-50 border-2 border-blue-300 border-dashed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="h-full overflow-y-auto">
            {candidates.length > 0 ? (
              candidates.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  onDragStart={() => {}} // Drag start is handled by the card itself
                  onViewProfile={onViewProfile}
                  onAddNote={onAddNote}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-xs text-center">No candidates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
