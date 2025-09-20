import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAssessmentStore from "@/stores/assessmentStore";
import useJobStore from "@/stores/jobStore";
import { AssessmentHeader } from "./AssessmentHeader";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { AssessmentNavigation } from "./AssessmentNavigation";
import {
  LoadingState,
  ErrorState,
  SubmittedState,
  NoAssessmentState,
} from "./LoadingStates";

export default function AssessmentTaking() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [candidateId] = useState(`candidate-${Date.now()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const {
    currentAssessment,
    loading,
    error,
    responses,
    validationErrors,
    loadAssessment,
    submitAssessment,
    updateResponse,
    validateAllResponses,
    clearResponses,
    isQuestionVisible,
    getVisibleQuestions,
  } = useAssessmentStore();

  const { jobs, getJob } = useJobStore();
  const [currentJob, setCurrentJob] = useState(null);

  // Memoize the updateResponse function to prevent unnecessary re-renders
  const handleUpdateResponse = useCallback(
    (questionId, value) => {
      updateResponse(questionId, value);
    },
    [updateResponse]
  );

  // Auto-save responses
  useEffect(() => {
    if (jobId && Object.keys(responses).length > 0) {
      setAutoSaveStatus("saving");
      const timeoutId = setTimeout(() => {
        try {
          setAutoSaveStatus("saved");
        } catch (error) {
          setAutoSaveStatus("error");
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [responses, jobId, candidateId]);

  // Load job and assessment data
  useEffect(() => {
    if (jobId) {
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        setCurrentJob(job);
      } else {
        getJob(jobId)
          .then((job) => setCurrentJob(job))
          .catch((error) => console.error("Failed to load job:", error));
      }

      loadAssessment(jobId).catch((error) =>
        console.error("Failed to load assessment:", error)
      );
    }
  }, [jobId, jobs, getJob, loadAssessment]);

  const handleSubmit = async () => {
    if (!validateAllResponses()) {
      const firstErrorElement = document.querySelector(
        '[data-has-error="true"]'
      );
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAssessment(jobId, candidateId, responses);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => navigate("/app/jobs");
  const handleTrySample = () => navigate("/app/assessment/job-1");
  const handleRetakeAssessment = () => {
    setIsSubmitted(false);
    clearResponses();
  };

  // Early returns for different states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBackClick={handleBackClick} />;
  if (isSubmitted) {
    return (
      <SubmittedState
        currentJob={currentJob}
        onBackToJobs={handleBackClick}
        onRetakeAssessment={handleRetakeAssessment}
      />
    );
  }

  if (!currentAssessment) {
    return (
      <NoAssessmentState
        jobId={jobId}
        loading={loading}
        error={error}
        currentAssessment={currentAssessment}
        currentJob={currentJob}
        onBackClick={handleBackClick}
        onTrySample={handleTrySample}
      />
    );
  }

  if (!currentAssessment.sections || currentAssessment.sections.length === 0) {
    return (
      <ErrorState
        error="This assessment doesn't have any sections configured yet."
        onBackClick={handleBackClick}
      />
    );
  }

  const visibleSections = currentAssessment.sections.filter(
    (section) => getVisibleQuestions(section).length > 0
  );

  if (visibleSections.length === 0) {
    return (
      <ErrorState
        error="This assessment doesn't have any visible questions."
        onBackClick={handleBackClick}
      />
    );
  }

  const safeCurrentSection = Math.max(
    0,
    Math.min(currentSection, visibleSections.length - 1)
  );
  const currentSectionData = visibleSections[safeCurrentSection];
  const visibleQuestions = currentSectionData
    ? getVisibleQuestions(currentSectionData)
    : [];

  // Calculate progress
  const totalQuestions = currentAssessment.sections.reduce(
    (total, section) => total + getVisibleQuestions(section).length,
    0
  );

  const answeredQuestions = Object.keys(responses).filter((questionId) => {
    const value = responses[questionId];
    return (
      value !== "" &&
      value !== undefined &&
      value !== null &&
      (!Array.isArray(value) || value.length > 0)
    );
  }).length;

  const progress =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const currentSectionProgress =
    visibleQuestions.length > 0
      ? (visibleQuestions.filter((q) => {
          const value = responses[q.id];
          return (
            value !== "" &&
            value !== undefined &&
            value !== null &&
            (!Array.isArray(value) || value.length > 0)
          );
        }).length /
          visibleQuestions.length) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader
        currentAssessment={currentAssessment}
        currentJob={currentJob}
        currentSection={safeCurrentSection}
        totalSections={visibleSections.length}
        autoSaveStatus={autoSaveStatus}
        progress={progress}
        currentSectionProgress={currentSectionProgress}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        onBackClick={handleBackClick}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Section {safeCurrentSection + 1}</Badge>
              <CardTitle>
                {currentSectionData?.title || "Assessment Section"}
              </CardTitle>
            </div>
            {currentSectionData?.description && (
              <CardDescription>
                {currentSectionData.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {visibleQuestions.map((question, index) => (
              <div
                key={question.id}
                className="pb-8 border-b last:border-b-0 last:pb-0"
              >
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <AssessmentQuestion
                      question={question}
                      value={responses[question.id]}
                      errors={validationErrors[question.id] || []}
                      onUpdateResponse={handleUpdateResponse}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <AssessmentNavigation
          currentSection={safeCurrentSection}
          sections={visibleSections}
          responses={responses}
          isSubmitting={isSubmitting}
          getVisibleQuestions={getVisibleQuestions}
          onPreviousSection={() =>
            setCurrentSection(Math.max(0, safeCurrentSection - 1))
          }
          onNextSection={() => setCurrentSection(safeCurrentSection + 1)}
          onSectionClick={setCurrentSection}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
