import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import {
  ShortTextInput,
  LongTextInput,
  SingleChoiceInput,
  MultiChoiceInput,
  NumericInput,
  FileUploadInput,
} from "./QuestionInputs";

const QuestionInput = React.memo(({ question, value, hasErrors, onChange }) => {
  const getNumericValidationMessage = (question) => {
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
  };

  switch (question.type) {
    case "short-text":
      return (
        <ShortTextInput
          question={question}
          value={value}
          hasErrors={hasErrors}
          onChange={onChange}
        />
      );

    case "long-text":
      return (
        <LongTextInput
          question={question}
          value={value}
          hasErrors={hasErrors}
          onChange={onChange}
        />
      );

    case "single-choice":
      return (
        <SingleChoiceInput
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "multi-choice":
      return (
        <MultiChoiceInput
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "numeric":
      return (
        <NumericInput
          question={question}
          value={value}
          hasErrors={hasErrors}
          onChange={onChange}
          validationMessage={getNumericValidationMessage(question)}
        />
      );

    case "file-upload":
      return (
        <FileUploadInput
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
});

export const AssessmentQuestion = React.memo(
  ({ question, value, errors, onUpdateResponse }) => {
    const hasErrors = errors.length > 0;

    // Use useCallback to prevent unnecessary re-renders that cause focus loss
    const handleInputChange = useCallback(
      (newValue) => {
        onUpdateResponse(question.id, newValue);
      },
      [question.id, onUpdateResponse]
    );

    return (
      <div className="space-y-3" data-has-error={hasErrors}>
        <Label className="flex items-center space-x-2 text-base font-medium">
          <span>{question.title}</span>
          {question.required && <span className="text-red-500">*</span>}
        </Label>

        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}

        <div className="space-y-2">
          <QuestionInput
            question={question}
            value={value}
            hasErrors={hasErrors}
            onChange={handleInputChange}
          />

          {hasErrors && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
