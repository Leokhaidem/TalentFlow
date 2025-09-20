import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // adjust the path if different
import useAssessmentStore from "@/stores/assessmentStore"; // your zustand store

export default function ConditionalValueInput({ sectionId, question }) {
  const updateQuestion = useAssessmentStore((state) => state.updateQuestion);
  const [localValue, setLocalValue] = useState(
    question.conditional?.value || ""
  );

  useEffect(() => {
    setLocalValue(question.conditional?.value || "");
  }, [question.conditional?.value]);

  const handleBlur = () => {
    updateQuestion(sectionId, question.id, {
      conditional: {
        ...question.conditional,
        value: localValue,
      },
    });
  };

  return (
    <Input
      placeholder="Value to compare"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="h-8"
    />
  );
}
