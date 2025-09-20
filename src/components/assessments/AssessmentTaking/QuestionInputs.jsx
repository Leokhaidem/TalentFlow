import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const ShortTextInput = React.memo(
  ({ question, value, hasErrors, onChange }) => {
    const maxLength = question.validation?.find(
      (r) => r.type === "max-length"
    )?.value;

    return (
      <div className="space-y-1">
        <Input
          placeholder="Your answer..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full",
            hasErrors && "border-red-500 focus:border-red-500"
          )}
          maxLength={maxLength}
        />
        {maxLength && (
          <div className="text-xs text-gray-500 text-right">
            {(value || "").length} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

export const LongTextInput = React.memo(
  ({ question, value, hasErrors, onChange }) => {
    const maxLength = question.validation?.find(
      (r) => r.type === "max-length"
    )?.value;
    const minLength = question.validation?.find(
      (r) => r.type === "min-length"
    )?.value;

    return (
      <div className="space-y-1">
        <Textarea
          placeholder="Your detailed answer..."
          rows={6}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full resize-none",
            hasErrors && "border-red-500 focus:border-red-500"
          )}
          maxLength={maxLength}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{minLength && `Minimum ${minLength} characters`}</span>
          <span>
            {(value || "").length}
            {maxLength && ` / ${maxLength}`}
          </span>
        </div>
      </div>
    );
  }
);

export const SingleChoiceInput = React.memo(({ question, value, onChange }) => {
  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="text-blue-600"
          />
          <span className="flex-1 text-sm">{option}</span>
        </label>
      ))}
    </div>
  );
});

export const MultiChoiceInput = React.memo(({ question, value, onChange }) => {
  const handleCheckboxChange = useCallback(
    (option, isChecked) => {
      const current = value || [];
      const newValue = isChecked
        ? [...current, option]
        : current.filter((item) => item !== option);
      onChange(newValue);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label
          key={index}
          className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <input
            type="checkbox"
            value={option}
            checked={(value || []).includes(option)}
            onChange={(e) => handleCheckboxChange(option, e.target.checked)}
            className="text-blue-600"
          />
          <span className="flex-1 text-sm">{option}</span>
        </label>
      ))}
    </div>
  );
});

export const NumericInput = React.memo(
  ({ question, value, hasErrors, onChange, validationMessage }) => {
    const minValue = question.validation?.find(
      (r) => r.type === "min-value"
    )?.value;
    const maxValue = question.validation?.find(
      (r) => r.type === "max-value"
    )?.value;

    return (
      <div className="space-y-1">
        <Input
          type="number"
          placeholder="Enter a number..."
          value={value || ""}
          onChange={(e) => {
            const inputValue = e.target.value;
            onChange(inputValue ? parseFloat(inputValue) : "");
          }}
          className={cn(
            "w-full",
            hasErrors && "border-red-500 focus:border-red-500"
          )}
          min={minValue}
          max={maxValue}
        />
        <p className="text-xs text-gray-500">{validationMessage}</p>
      </div>
    );
  }
);

export const FileUploadInput = React.memo(({ question, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onChange({
              name: file.name,
              size: file.size,
              type: file.type,
            });
          } else {
            onChange("");
          }
        }}
        className="w-full"
        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
      />
      {value && typeof value === "object" && (
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div className="flex items-center justify-between">
            <span>{value.name}</span>
            <span>{Math.round(value.size / 1024)}KB</span>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
      </p>
    </div>
  );
});
