import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


export default function AssessmentDetails({
  currentAssessment,
  updateAssessment,
}) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Assessment Details</CardTitle>
        <CardDescription>
          Basic information about this assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={currentAssessment.title}
            onChange={(e) => updateAssessment({ title: e.target.value })}
            placeholder="Assessment title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={currentAssessment.description || ""}
            onChange={(e) => updateAssessment({ description: e.target.value })}
            placeholder="Brief description of the assessment"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
