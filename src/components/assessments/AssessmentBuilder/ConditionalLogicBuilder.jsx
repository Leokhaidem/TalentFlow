import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


import ConditionalValueInput from "./ConditionalValueInput";

export default function ConditionalLogicBuilder({
  question,
  sectionId,
  allQuestions,
  updateQuestion,
}) {
  const availableQuestions = allQuestions.filter((q) => q.id !== question.id);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Conditional Logic</Label>
      <div className="flex items-center space-x-2">
        <Switch
          checked={!!question.conditional}
          onCheckedChange={(checked) =>
            updateQuestion(sectionId, question.id, {
              conditional: checked
                ? { dependsOn: "", operator: "equals", value: "" }
                : undefined,
            })
          }
        />
        <span className="text-xs">Show this question conditionally</span>
      </div>

      {question.conditional && (
        <div className="space-y-2 p-2 border rounded">
          <Select
            value={question.conditional.dependsOn}
            onValueChange={(value) =>
              updateQuestion(sectionId, question.id, {
                conditional: { ...question.conditional, dependsOn: value },
              })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Depends on question" />
            </SelectTrigger>
            <SelectContent>
              {availableQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={question.conditional.operator}
            onValueChange={(value) =>
              updateQuestion(sectionId, question.id, {
                conditional: { ...question.conditional, operator: value },
              })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="not-equals">Not Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
            </SelectContent>
          </Select>

          <ConditionalValueInput sectionId={sectionId} question={question} />
        </div>
      )}
    </div>
  );
}
