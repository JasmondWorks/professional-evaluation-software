// Single source of truth for the auditor onboarding questionnaire. Three
// copies of this list had drifted out of sync (10 vs 13 questions, different
// wording) which misaligned admin-side review against what was actually
// submitted — import from here instead of inlining the list again.
export const AUDITOR_QUESTIONS = [
  "Will you be validating the input data for the current Appraisal and evaluation period?",
  "Will you be validating the entire process based on accountability and fair judgment?",
  "Will your validating of the process be based on Guided Standard which you will make available at the end of the process?",
  "Will exceptions be raised for conflicts detected in the system?",
  "Will your roles as an invited external auditor be independent?",
  "Are you ready to suggest workable frameworks where you deem it fit?",
  "Do you accept that your Management letter at the end of the process be made available globally for use? (After the excercise, ensure to upload the letter of service given to you by the management)",
  "Where awards are applicable for motivation purposes as suggested by the system software, will you validate to ensure that there isn’t marginalization or nepotism?",
  "Are you welcome to open criticism?",
  "Will you be executing on proxy this exercise you are called on to do?",
  "Will this exercise you are called on to do be done remotely?",
  "If invited again in the future, will you accept the invitation even if you were openly criticized?",
  "Do you want your role to be recognized globally by this app?",
] as const;

// Index of the question whose "Yes" answer seeds the platform admin's
// global-recognition review queue.
export const GLOBAL_RECOGNITION_QUESTION_INDEX = 12;
