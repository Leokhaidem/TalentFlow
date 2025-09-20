import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useAssessmentStore from "@/stores/assessmentStore";

export default function AssessmentPreview({ assessment }) {
  const { responses, updateResponse, validationErrors, isQuestionVisible, getVisibleQuestions } = useAssessmentStore();

  if (!assessment) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No assessment to preview
      </div>
    );
  }

  const PreviewQuestion = ({ question }) => {
    const errors = validationErrors[question.id] || [];
    const hasErrors = errors.length > 0;
    const currentValue = responses[question.id];

    if (!isQuestionVisible(question)) {
      return null;
    }

    return (
      <div className="space-y-3" data-has-error={hasErrors}>
        <Label className="flex items-center space-x-2 text-base font-medium">
          <span>{question.title}</span>
          {question.required && <span className="text-destructive">*</span>}
        </Label>

        {question.description && (
          <p className="text-sm text-muted-foreground">
            {question.description}
          </p>
        )}

        <div className="space-y-2">
          {question.type === "short-text" && (
            <div className="space-y-1">
              <Input
                placeholder="Your answer..."
                value={currentValue || ""}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                className={cn(
                  "w-full",
                  hasErrors && "border-destructive focus:border-destructive"
                )}
                maxLength={
                  question.validation?.find((r) => r.type === "max-length")
                    ?.value
                }
              />
              {question.validation?.find((r) => r.type === "max-length") && (
                <div className="text-xs text-muted-foreground text-right">
                  {(currentValue || "").length} /{" "}
                  {
                    question.validation.find((r) => r.type === "max-length")
                      .value
                  }
                </div>
              )}
            </div>
          )}

          {question.type === "long-text" && (
            <div className="space-y-1">
              <Textarea
                placeholder="Your detailed answer..."
                rows={4}
                value={currentValue || ""}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                className={cn(
                  "w-full resize-none",
                  hasErrors && "border-destructive focus:border-destructive"
                )}
                maxLength={
                  question.validation?.find((r) => r.type === "max-length")
                    ?.value
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {question.validation?.find((r) => r.type === "min-length") &&
                    `Minimum ${
                      question.validation.find((r) => r.type === "min-length")
                        .value
                    } characters`}
                </span>
                <span>
                  {(currentValue || "").length}
                  {question.validation?.find((r) => r.type === "max-length") &&
                    ` / ${
                      question.validation.find((r) => r.type === "max-length")
                        .value
                    }`}
                </span>
              </div>
            </div>
          )}

          {question.type === "single-choice" && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={currentValue === option}
                    onChange={(e) =>
                      updateResponse(question.id, e.target.value)
                    }
                    className="text-primary"
                  />
                  <span className="flex-1 text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "multi-choice" && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={(currentValue || []).includes(option)}
                    onChange={(e) => {
                      const current = currentValue || [];
                      const newValue = e.target.checked
                        ? [...current, option]
                        : current.filter((item) => item !== option);
                      updateResponse(question.id, newValue);
                    }}
                    className="text-primary"
                  />
                  <span className="flex-1 text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "numeric" && (
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Enter a number..."
                value={currentValue || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateResponse(question.id, value ? parseFloat(value) : "");
                }}
                className={cn(
                  "w-full",
                  hasErrors && "border-destructive focus:border-destructive"
                )}
                min={
                  question.validation?.find((r) => r.type === "min-value")
                    ?.value
                }
                max={
                  question.validation?.find((r) => r.type === "max-value")
                    ?.value
                }
              />
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const validation = question.validation || [];
                  const minRule = validation.find((r) => r.type === "min-value");
                  const maxRule = validation.find((r) => r.type === "max-value");

                  if (minRule && maxRule) {
                    return `Enter a number between ${minRule.value} and ${maxRule.value}`;
                  } else if (minRule) {
                    return `Enter a number greater than or equal to ${minRule.value}`;
                  } else if (maxRule) {
                    return `Enter a number less than or equal to ${maxRule.value}`;
                  }
                  return "Enter a valid number";
                })()}
              </p>
            </div>
          )}

          {question.type === "file-upload" && (
            <div className="space-y-2">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateResponse(question.id, {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    });
                  } else {
                    updateResponse(question.id, "");
                  }
                }}
                className="w-full"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
              />
              {currentValue && typeof currentValue === "object" && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <div className="flex items-center justify-between">
                    <span>{currentValue.name}</span>
                    <span>{Math.round(currentValue.size / 1024)}KB</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
              </p>
            </div>
          )}

          {hasErrors && (
            <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {assessment.title}
        </h2>
        <p className="text-muted-foreground">
          {assessment.description}
        </p>
      </div>

      {assessment.sections.map((section) => {
        const visibleQuestions = getVisibleQuestions(section);
        if (visibleQuestions.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>

            {visibleQuestions.map((question) => (
              <PreviewQuestion
                key={question.id}
                question={question}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
