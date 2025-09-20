import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SectionIndicators = ({
  sections,
  currentSection,
  responses,
  getVisibleQuestions,
  onSectionClick,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {sections.map((section, index) => {
        const sectionQuestions = getVisibleQuestions(section);
        const sectionAnswered = sectionQuestions.filter((q) => {
          const value = responses[q.id];
          return (
            value !== "" &&
            value !== undefined &&
            value !== null &&
            (!Array.isArray(value) || value.length > 0)
          );
        }).length;
        const sectionComplete = sectionAnswered === sectionQuestions.length;

        return (
          <Button
            key={index}
            variant={index === currentSection ? "default" : "outline"}
            size="sm"
            onClick={() => onSectionClick(index)}
            className={cn(
              "w-8 h-8 p-0 relative",
              sectionComplete &&
                index !== currentSection &&
                "ring-2 ring-green-500"
            )}
          >
            {index + 1}
            {sectionComplete && index !== currentSection && (
              <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 bg-green-500 text-white rounded-full" />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export const AssessmentNavigation = ({
  currentSection,
  sections,
  responses,
  isSubmitting,
  getVisibleQuestions,
  onPreviousSection,
  onNextSection,
  onSectionClick,
  onSubmit,
}) => {
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="flex justify-between items-center mt-8">
      <Button
        variant="outline"
        onClick={onPreviousSection}
        disabled={isFirstSection}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous Section</span>
      </Button>

      <SectionIndicators
        sections={sections}
        currentSection={currentSection}
        responses={responses}
        getVisibleQuestions={getVisibleQuestions}
        onSectionClick={onSectionClick}
      />

      {isLastSection ? (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Assessment</span>
            </>
          )}
        </Button>
      ) : (
        <Button onClick={onNextSection} className="flex items-center space-x-2">
          <span>Next Section</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
