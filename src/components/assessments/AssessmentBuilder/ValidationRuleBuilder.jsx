import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Trash2 } from "lucide-react";

export default function ValidationRuleBuilder({
  question,
  sectionId,
  updateQuestion,
}) {
  const addValidationRule = (rule) => {
    const currentRules = question.validation || [];
    updateQuestion(sectionId, question.id, {
      validation: [...currentRules, rule],
    });
  };

  const removeValidationRule = (index) => {
    const currentRules = question.validation || [];
    updateQuestion(sectionId, question.id, {
      validation: currentRules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Validation Rules</Label>
      {question.validation?.map((rule, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <Badge variant="outline">
            {rule.type}: {rule.value}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeValidationRule(index)}
            className="h-4 w-4 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Select
        onValueChange={(value) => {
          const defaultRules = {
            "min-length": {
              type: "min-length",
              value: 10,
              message: "Minimum 10 characters required",
            },
            "max-length": {
              type: "max-length",
              value: 500,
              message: "Maximum 500 characters allowed",
            },
            "min-value": {
              type: "min-value",
              value: 0,
              message: "Value must be positive",
            },
            "max-value": {
              type: "max-value",
              value: 1000000,
              message: "Value too large",
            },
          };
          if (defaultRules[value]) addValidationRule(defaultRules[value]);
        }}
      >
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Add validation rule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="min-length">Minimum Length</SelectItem>
          <SelectItem value="max-length">Maximum Length</SelectItem>
          <SelectItem value="min-value">Minimum Value</SelectItem>
          <SelectItem value="max-value">Maximum Value</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
