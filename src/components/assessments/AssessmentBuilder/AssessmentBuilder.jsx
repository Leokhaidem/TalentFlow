import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAssessmentStore from "@/stores/assessmentStore";
import useJobStore from "@/stores/jobStore";

import AssessmentDetails from "./AssessmentDetails";
import SectionBuilder from "./SectionBuilder";
import AssessmentPreview from "./AssessmentPreview";

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("builder");

  const {
    currentAssessment,
    loading,
    previewMode,
    validateAllResponses,
    loadAssessment,
    saveAssessment,
    createAssessment,
    updateAssessment,
    addSection,
    updateSection,
    deleteSection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    setPreviewMode,
  } = useAssessmentStore();

  const { jobs, getJob } = useJobStore();
  const [currentJob, setCurrentJob] = useState(null);

  useEffect(() => {
    if (jobId) {
      const job = jobs.find((j) => j.id === jobId);
      if (job) setCurrentJob(job);
      else getJob(jobId).then(setCurrentJob).catch(console.error);

      loadAssessment(jobId).catch(console.error);
    }
  }, [jobId, jobs, getJob, loadAssessment]);

  const handleSaveAssessment = async () => {
    if (currentAssessment && jobId) {
      try {
        await saveAssessment(jobId, currentAssessment);
        alert("Assessment saved successfully!");
        navigate(`/app/jobs`);
      } catch (error) {
        console.error("Failed to save assessment:", error);
        alert("Failed to save assessment. Please try again.");
      }
    }
  };

  const handleCreateAssessment = async () => {
    if (!jobId) return;
    try {
      await createAssessment(jobId);
    } catch (error) {
      console.error("Failed to create assessment:", error);
      alert("Failed to create assessment. Please try again.");
    }
  };

  const allQuestions =
    currentAssessment?.sections.flatMap((s) => s.questions) || [];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/jobs")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Assessment Builder
            </h1>
            <p className="text-muted-foreground">
              {currentJob
                ? `Building assessment for ${currentJob.title}`
                : "Create and manage job assessments"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/assessments/${jobId}/take`)}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Test Assessment</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            {previewMode ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>{previewMode ? "Edit Mode" : "Preview Mode"}</span>
          </Button>
          <Button
            onClick={handleSaveAssessment}
            className="gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Assessment
          </Button>
        </div>
      </div>

      {currentAssessment ? (
        <div
          className={cn(
            "grid gap-8",
            previewMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}
        >
          {!previewMode && (
            <div className="space-y-6">
              <AssessmentDetails
                currentAssessment={currentAssessment}
                updateAssessment={updateAssessment}
              />

              {currentAssessment.sections.map((section, index) => (
                <SectionBuilder
                  key={`section-${section.id}-${index}`}
                  section={section}
                  allQuestions={allQuestions}
                  updateSection={updateSection}
                  deleteSection={deleteSection}
                  addQuestion={addQuestion}
                  updateQuestion={updateQuestion}
                  deleteQuestion={deleteQuestion}
                />
              ))}

              <Button
                variant="outline"
                onClick={addSection}
                className="w-full border-dashed"
              >
                + Add Section
              </Button>
            </div>
          )}

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Assessment Preview</h2>
                  {previewMode && <span className="badge">Preview Mode</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <AssessmentPreview assessment={currentAssessment} />
                {previewMode && (
                  <Button
                    className="gradient-primary text-white w-full"
                    onClick={() => {
                      const isValid = validateAllResponses();
                      alert(
                        isValid
                          ? "Assessment is valid!"
                          : "Fix validation errors!"
                      );
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validate & Test Submit
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No assessment found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first assessment for this job position
            </p>
            <Button
              onClick={handleCreateAssessment}
              className="gradient-primary text-white"
            >
              + Create Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
