import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {  Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import QuestionBuilder from "./QuestionBuilder";

const questionTypes = [
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
];

export default function SectionBuilder({
  section,
  allQuestions,
  updateSection,
  deleteSection,
  addQuestion,
  updateQuestion,
  deleteQuestion,
}) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Input
              value={section.title}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              className="text-lg font-semibold border-none p-0 focus:border-none focus:ring-0"
              placeholder="Section title"
            />
            <Input
              value={section.description || ""}
              onChange={(e) =>
                updateSection(section.id, { description: e.target.value })
              }
              className="text-sm text-muted-foreground border-none p-0 focus:border-none focus:ring-0"
              placeholder="Section description"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteSection(section.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.questions.map((question) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            sectionId={section.id}
            allQuestions={allQuestions}
            updateQuestion={updateQuestion}
            deleteQuestion={deleteQuestion}
          />
        ))}

        <div className="flex flex-wrap gap-2">
          {questionTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => addQuestion(section.id, type.value)}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>{type.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
