import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

/**
 * @typedef {Object} ValidationRule
 * @property {'min-length'|'max-length'|'min-value'|'max-value'|'required'} type
 * @property {number} value
 * @property {string} message
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {'short-text'|'long-text'|'single-choice'|'multi-choice'|'numeric'|'file-upload'} type
 * @property {string} title
 * @property {string} [description]
 * @property {boolean} required
 * @property {number} order
 * @property {string[]} [options] - for choice questions
 * @property {ValidationRule[]} [validation]
 * @property {Object} [conditional] - for conditional logic
 */

const useAssessmentStore = create(
  devtools(
    persist(
      (set, get) => ({
        currentAssessment: null,
        responses: {},
        validationErrors: {},
        previewMode: false,

        setPreviewMode: (previewMode) => set({ previewMode }),

        // Load assessment for a job
        // Load assessment for a job
        loadAssessment: async (jobId) => {
          console.log(`[Store] Loading assessment for jobId: ${jobId}`);

          try {
            const response = await axios.get(`/api/assessments/${jobId}`);
            console.log(`[Store] API response:`, response.data);

            const assessment = response.data?.data ?? response.data;
            console.log(`[Store] Processed assessment:`, assessment);

            if (!assessment) {
              set({ currentAssessment: null });
              return null;
            }

            set({
              currentAssessment: assessment,
            });

            return assessment;
          } catch (error) {
            console.error(`[Store] Error loading assessment:`, error);

            if (error.response?.status === 404) {
              console.log(`[Store] No assessment found for ${jobId}`);
              set({
                currentAssessment: null,
              });
              return null;
            }

            throw error;
          }
        },

        // Submit assessment response
        submitAssessment: async (jobId, candidateId, responses) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.post(
              `/api/assessments/${jobId}/submit`,
              {
                candidateId,
                responses,
              }
            );

            const result = response.data?.data ?? response.data;
            set({ loading: false });
            return result;
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Validate a single response
        validateResponse: (question, value) => {
          const errors = [];

          // Required validation
          if (
            question.required &&
            (!value || (Array.isArray(value) && value.length === 0))
          ) {
            errors.push("This field is required");
            return errors;
          }

          // Skip other validations if empty and not required
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return errors;
          }

          // Apply validation rules
          if (question.validation) {
            question.validation.forEach((rule) => {
              switch (rule.type) {
                case "min-length":
                  if (typeof value === "string" && value.length < rule.value) {
                    errors.push(
                      rule.message ||
                        `Minimum ${rule.value} characters required`
                    );
                  }
                  break;
                case "max-length":
                  if (typeof value === "string" && value.length > rule.value) {
                    errors.push(
                      rule.message || `Maximum ${rule.value} characters allowed`
                    );
                  }
                  break;
                case "min-value":
                  if (typeof value === "number" && value < rule.value) {
                    errors.push(
                      rule.message || `Minimum value is ${rule.value}`
                    );
                  }
                  break;
                case "max-value":
                  if (typeof value === "number" && value > rule.value) {
                    errors.push(
                      rule.message || `Maximum value is ${rule.value}`
                    );
                  }
                  break;
              }
            });
          }

          return errors;
        },

        // Update response to a question with validation
        updateResponse: (questionId, value) => {
          const { responses, currentAssessment, validationErrors } = get();

          // Find the question to validate
          let question = null;
          if (currentAssessment) {
            for (const section of currentAssessment.sections) {
              question = section.questions.find((q) => q.id === questionId);
              if (question) break;
            }
          }

          // Validate the response
          const errors = question
            ? get().validateResponse(question, value)
            : [];

          set({
            responses: {
              ...responses,
              [questionId]: value,
            },
            validationErrors: {
              ...validationErrors,
              [questionId]: errors,
            },
          });
        },

        // Check if a question should be visible based on conditional logic
        isQuestionVisible: (question) => {
          console.log("store question",question)
          if (!question.conditional?.dependsOn) return true;

          const { responses } = get();
          console.log("responses", responses);
          const dependentValue = responses[question.conditional.dependsOn];

          if (!dependentValue) return false;

          switch (question.conditional.operator) {
            case "equals":
              return dependentValue === question.conditional.value;
            case "not-equals":
              return dependentValue !== question.conditional.value;
            case "contains":
              return (
                Array.isArray(dependentValue) &&
                dependentValue.includes(question.conditional.value)
              );
            case "greater-than":
              return (
                typeof dependentValue === "number" &&
                dependentValue > parseFloat(question.conditional.value)
              );
            case "less-than":
              return (
                typeof dependentValue === "number" &&
                dependentValue < parseFloat(question.conditional.value)
              );
            default:
              return true;
          }
        },

        // Get visible questions for a section
        getVisibleQuestions: (section) => {
          console.log("store section",section.questions.filter((question)=>get().isQuestionVisible(question)))
          return section.questions.filter((question) =>
            get().isQuestionVisible(question)
          );
        },

        // Validate all responses
        validateAllResponses: () => {
          const { currentAssessment, responses } = get();
          if (!currentAssessment) return false;

          const newValidationErrors = {};
          let hasErrors = false;

          currentAssessment.sections.forEach((section) => {
            section.questions.forEach((question) => {
              if (get().isQuestionVisible(question)) {
                const value = responses[question.id];
                const errors = get().validateResponse(question, value);

                if (errors.length > 0) {
                  newValidationErrors[question.id] = errors;
                  hasErrors = true;
                }
              }
            });
          });

          set({ validationErrors: newValidationErrors });
          return !hasErrors;
        },

        // Clear responses
        clearResponses: () => set({ responses: {}, validationErrors: {} }),

        // Create a new assessment template
        createAssessment: async (jobId) => {
          set({ loading: true, error: null });

          const newAssessment = {
            id: `assessment-${jobId}-${Date.now()}`,
            jobId,
            title: "New Assessment",
            description:
              "Please complete this assessment to help us evaluate your fit for this role.",
            sections: [
              {
                id: `section-${Date.now()}`,
                title: "General Questions",
                description:
                  "Basic questions about your background and experience.",
                order: 0,
                questions: [],
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const { assessments } = get();
          set({
            currentAssessment: newAssessment,
            assessments: { ...assessments, [jobId]: newAssessment },
            loading: false,
            error: null,
          });

          // Auto-save the new assessment to backend
          try {
            await get().saveAssessment(jobId, newAssessment);
          } catch (error) {
            console.error("Failed to save new assessment:", error);
            // Don't throw error, let user continue editing
          }

          return newAssessment;
        },

        // Update assessment details (title, description)
        updateAssessment: (updates) => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const updatedAssessment = {
            ...currentAssessment,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Save assessment to backend
        saveAssessment: async (jobId, assessment) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.put(`/api/assessments/${jobId}`, assessment);
            const savedAssessment = response.data?.data ?? response.data;
            
            set({ 
              currentAssessment: savedAssessment,
              loading: false 
            });
            
            return savedAssessment;
          } catch (error) {
            set({
              error: error.response?.data?.message || error.message,
              loading: false,
            });
            throw error;
          }
        },

        // Add a new section
        addSection: () => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const newSection = {
            id: `section-${Date.now()}`,
            title: "New Section",
            description: "",
            order: currentAssessment.sections.length,
            questions: [],
          };

          const updatedAssessment = {
            ...currentAssessment,
            sections: [...currentAssessment.sections, newSection],
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Update section
        updateSection: (sectionId, updates) => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const updatedAssessment = {
            ...currentAssessment,
            sections: currentAssessment.sections.map((section) =>
              section.id === sectionId ? { ...section, ...updates } : section
            ),
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Delete section
        deleteSection: (sectionId) => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const updatedAssessment = {
            ...currentAssessment,
            sections: currentAssessment.sections.filter(
              (section) => section.id !== sectionId
            ),
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Add a new question to a section
        addQuestion: (sectionId, questionType = "short-text") => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const section = currentAssessment.sections.find(
            (s) => s.id === sectionId
          );
          if (!section) return;

          const baseQuestion = {
            id: `question-${Date.now()}`,
            type: questionType,
            title: "New Question",
            description: "",
            required: false,
            order: section.questions.length,
          };

          // Add type-specific properties
          let newQuestion = { ...baseQuestion };

          switch (questionType) {
            case "single-choice":
            case "multi-choice":
              newQuestion.options = ["Option 1", "Option 2"];
              break;
            case "numeric":
              newQuestion.validation = [
                {
                  type: "min-value",
                  value: 0,
                  message: "Value must be positive",
                },
              ];
              break;
            case "long-text":
              newQuestion.validation = [
                {
                  type: "min-length",
                  value: 10,
                  message: "Please provide at least 10 characters",
                },
              ];
              break;
            case "short-text":
              newQuestion.validation = [
                {
                  type: "max-length",
                  value: 500,
                  message: "Please keep under 500 characters",
                },
              ];
              break;
          }

          const updatedAssessment = {
            ...currentAssessment,
            sections: currentAssessment.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  questions: [...section.questions, newQuestion],
                };
              }
              return section;
            }),
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Update question
        updateQuestion: (sectionId, questionId, updates) => {
          const { currentAssessment } = get();
          if (!currentAssessment) return;

          const updatedAssessment = {
            ...currentAssessment,
            sections: currentAssessment.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  questions: section.questions.map((question) =>
                    question.id === questionId
                      ? { ...question, ...updates }
                      : question
                  ),
                };
              }
              return section;
            }),
            updatedAt: new Date().toISOString(),
          };

          set({ currentAssessment: updatedAssessment });
        },

        // Delete question
        deleteQuestion: (sectionId, questionId) => {
          const { currentAssessment, responses, validationErrors } = get();
          if (!currentAssessment) return;

          // Clean up responses and validation errors
          const newResponses = { ...responses };
          const newValidationErrors = { ...validationErrors };
          delete newResponses[questionId];
          delete newValidationErrors[questionId];

          const updatedAssessment = {
            ...currentAssessment,
            sections: currentAssessment.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  questions: section.questions.filter(
                    (question) => question.id !== questionId
                  ),
                };
              }
              return section;
            }),
            updatedAt: new Date().toISOString(),
          };

          set({
            currentAssessment: updatedAssessment,
            responses: newResponses,
            validationErrors: newValidationErrors,
          });
        },

      }),
      {
        name: "assessment-store",
        partialize: (state) => ({
          currentAssessment: state.currentAssessment,
          responses: state.responses,
          previewMode: state.previewMode,
        }),
      }
    ),
    { name: "assessment-store" }
  )
);

export default useAssessmentStore;
