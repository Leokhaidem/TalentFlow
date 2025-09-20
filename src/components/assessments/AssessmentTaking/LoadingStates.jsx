import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, FileText, ArrowLeft } from "lucide-react";

export const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading assessment...</p>
    </div>
  </div>
);

export const ErrorState = ({ error, onBackClick }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assessment Not Available</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onBackClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const SubmittedState = ({
  currentJob,
  onBackToJobs,
  onRetakeAssessment,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Assessment Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for completing the assessment for{" "}
          <strong>{currentJob?.title || "this position"}</strong>. We'll review
          your responses and get back to you soon.
        </p>
        <div className="space-y-2">
          <Button onClick={onBackToJobs} className="w-full">
            Back to Job Listings
          </Button>
          <Button
            variant="outline"
            onClick={onRetakeAssessment}
            className="w-full"
          >
            Take Assessment Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const NoAssessmentState = ({
  jobId,
  loading,
  error,
  currentAssessment,
  currentJob,
  onBackClick,
  onTrySample,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Assessment Available
          </h3>
          <p className="text-gray-600 mb-4">
            This job position doesn't have an assessment yet.
          </p>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-700 overflow-auto">
            {JSON.stringify(
              {
                jobId,
                loading,
                error,
                hasCurrentAssessment: !!currentAssessment,
                currentJob: currentJob?.title || "Not loaded",
              },
              null,
              2
            )}
          </pre>

          <div className="mt-4 text-sm">
            <p className="mb-2">
              <strong>Available jobs in your database:</strong>
            </p>
            <ul className="text-xs space-y-1">
              <li>• job-1 (Senior Frontend Developer) - Has assessment</li>
              <li>• job-2 (Backend Engineer) - Has assessment</li>
              <li>• job-3 (Product Manager) - Has assessment</li>
              <li>• job-4 (UX/UI Designer) - Has assessment</li>
              <li>• job-5 (DevOps Engineer) - Has assessment</li>
              <li>• job-6+ (Others) - No assessments seeded</li>
            </ul>
            <p className="mt-2 text-blue-600">
              Try using URL: <code>/assessment/job-1</code> to see a working
              assessment
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button onClick={onBackClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <Button variant="outline" onClick={onTrySample} className="ml-2">
            Try Sample Assessment (job-1)
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
