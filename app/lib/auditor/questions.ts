/** The external auditor's questionnaire.
 *
 *  This list was duplicated: 13 questions in the accept form and a divergent
 *  10 in the submit route (whose copy also reworded Q7), so the admin
 *  notification email labelled answers with the wrong questions and the last
 *  three were reported as "No response". One array, imported by both.
 *
 *  Answers are stored positionally in `auditor_responses.responses`, so the
 *  ORDER HERE IS PERSISTED DATA. Append to the end; never reorder or remove.
 */
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

/** Consent to be visible platform-wide. Answering "Yes" here is what allows an
 *  admin to see this auditor's uploaded credentials; everything else on the
 *  record stays private to the submission queue. Read it through
 *  `hasRecognitionConsent` rather than indexing `responses` at a call site —
 *  the index is an implementation detail of the array above. */
export const RECOGNITION_QUESTION_INDEX = 12;

/** Whether the submitted answers consent to platform-wide recognition.
 *  Tolerant of casing and padding; anything that is not an affirmative "yes"
 *  is treated as withheld consent, which is the safe direction for a flag
 *  that gates document visibility. */
export function hasRecognitionConsent(responses: unknown): boolean {
  if (!Array.isArray(responses)) return false;
  const answer = responses[RECOGNITION_QUESTION_INDEX];
  return typeof answer === "string" && answer.trim().toLowerCase() === "yes";
}

/** The four credential slots the accept form uploads, in display order. The
 *  keys are the file input ids, and are also the keys persisted in
 *  `auditor_responses.credentials`. */
export const CREDENTIAL_SLOTS = [
  { key: "c_origin", label: "Certificate of recognition" },
  { key: "c_prof", label: "Professional certificate" },
  { key: "c_acad", label: "Academic certificate" },
  { key: "others", label: "Others" },
] as const;

export type CredentialKey = (typeof CREDENTIAL_SLOTS)[number]["key"];

/** Credential URLs as stored: slot key → uploaded file URL. Partial because
 *  only three of the four slots are required at submit time. */
export type AuditorCredentials = Partial<Record<CredentialKey, string>>;

const CREDENTIAL_KEYS = CREDENTIAL_SLOTS.map((s) => s.key) as readonly string[];

/** Narrows an untrusted payload to the credential slots we recognise, keeping
 *  only http(s) URLs. The accept form is public, so this is the boundary that
 *  stops an arbitrary string being stored and later rendered as a link. */
export function sanitizeCredentials(input: unknown): AuditorCredentials {
  const out: AuditorCredentials = {};
  if (!input || typeof input !== "object") return out;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!CREDENTIAL_KEYS.includes(key)) continue;
    if (typeof value !== "string" || !value) continue;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        out[key as CredentialKey] = parsed.toString();
      }
    } catch {
      // Not a URL — drop it rather than persist something unrenderable.
    }
  }
  return out;
}
