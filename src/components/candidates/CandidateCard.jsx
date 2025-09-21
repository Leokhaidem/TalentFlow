import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Phone, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import React from "react";

export default function CandidateCard({
  candidate,
  onDragStart,
  onViewProfile,
  onAddNote,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    try {
      e.dataTransfer.setData("text/plain", JSON.stringify(candidate));
      e.dataTransfer.effectAllowed = "move";
      console.log("Drag started for candidate:", candidate.name, "stage:", candidate.stage);
    } catch (err) {
      console.error("Error setting drag data:", err);
      // some browsers restrict dataTransfer in certain contexts
    }
    onDragStart?.(candidate);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <Card
      className={cn(
        "mb-3 cursor-move hover:shadow-md transition-all duration-200 bg-white border border-gray-200",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.email}`}
              />
              <AvatarFallback className="text-xs">
                {candidate.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {candidate.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {candidate.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation(); // This prevents the drag from starting
              onViewProfile?.(candidate);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {candidate.createdAt
              ? new Date(candidate.createdAt).toLocaleDateString()
              : "-"}
          </span>
          {candidate.phone && (
            <span className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {candidate.phone.slice(-4)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {candidate.notes && candidate.notes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                {candidate.notes.length}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={(e) => {
              e.stopPropagation();
              onAddNote?.(candidate);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
          >
            Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
