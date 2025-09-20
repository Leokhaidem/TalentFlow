import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Save, AlertCircle } from "lucide-react";

const AutoSaveStatus = ({ status }) => {
  switch (status) {
    case "saving":
      return (
        <div className="flex items-center space-x-1 text-gray-600 text-sm">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
          <span>Saving...</span>
        </div>
      );
    case "saved":
      return (
        <div className="flex items-center space-x-1 text-green-600 text-sm">
          <Save className="w-3 h-3" />
          <span>Saved</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-3 h-3" />
          <span>Save Error</span>
        </div>
      );
    default:
      return null;
  }
};

export const AssessmentHeader = ({
  currentAssessment,
  currentJob,
  currentSection,
  totalSections,
  autoSaveStatus,
  progress,
  currentSectionProgress,
  answeredQuestions,
  totalQuestions,
  onBackClick,
}) => {
  return (
    <div className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentAssessment.title}</h1>
              <p className="text-sm text-gray-600">
                {currentJob?.title || "Assessment"} • Section{" "}
                {currentSection + 1} of {totalSections}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <AutoSaveStatus status={autoSaveStatus} />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Progress: {Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Overall Progress</span>
            <span>
              {answeredQuestions} of {totalQuestions} questions
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="flex justify-between text-xs text-gray-600">
            <span>Current Section</span>
            <span>{Math.round(currentSectionProgress)}%</span>
          </div>
          <Progress value={currentSectionProgress} className="h-1" />
        </div>
      </div>
    </div>
  );
};
