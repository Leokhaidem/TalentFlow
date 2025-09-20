import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Trash2, Plus } from "lucide-react";
import ValidationRuleBuilder from "./ValidationRuleBuilder";
import ConditionalLogicBuilder from "./ConditionalLogicBuilder";

const QuestionBuilder = memo(
  ({ question, sectionId, allQuestions, updateQuestion, deleteQuestion }) => {
    const questionTypes = [
      {
        value: "short-text",
        label: "Short Text",
        description: "Single line text input",
      },
      {
        value: "long-text",
        label: "Long Text",
        description: "Multi-line text area",
      },
      {
        value: "single-choice",
        label: "Single Choice",
        description: "Radio button selection",
      },
      {
        value: "multi-choice",
        label: "Multiple Choice",
        description: "Checkbox selection",
      },
      {
        value: "numeric",
        label: "Numeric",
        description: "Number input with validation",
      },
      {
        value: "file-upload",
        label: "File Upload",
        description: "File attachment",
      },
    ];

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <Select
                value={question.type}
                onValueChange={(value) =>
                  updateQuestion(sectionId, question.id, { type: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(sectionId, question.id, { required: checked })
                }
              />
              <span className="text-sm">Required</span>
            </div>

            <Input
              value={question.title}
              onChange={(e) =>
                updateQuestion(sectionId, question.id, {
                  title: e.target.value,
                })
              }
              placeholder="Question title"
            />

            <Textarea
              value={question.description || ""}
              onChange={(e) =>
                updateQuestion(sectionId, question.id, {
                  description: e.target.value,
                })
              }
              placeholder="Question description (optional)"
              rows={2}
            />

            {(question.type === "single-choice" ||
              question.type === "multi-choice") && (
              <div className="space-y-2">
                <Label>Options</Label>
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[index] = e.target.value;
                        updateQuestion(sectionId, question.id, {
                          options: newOptions,
                        });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions =
                          question.options?.filter((_, i) => i !== index) || [];
                        updateQuestion(sectionId, question.id, {
                          options: newOptions,
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuestion(sectionId, question.id, {
                      options: [...(question.options || []), "New option"],
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>
            )}

            <ValidationRuleBuilder
              question={question}
              sectionId={sectionId}
              updateQuestion={updateQuestion}
            />
            <ConditionalLogicBuilder
              question={question}
              sectionId={sectionId}
              allQuestions={allQuestions}
              updateQuestion={updateQuestion}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
);

export default QuestionBuilder;
