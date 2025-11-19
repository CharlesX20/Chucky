interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

// UPDATED: Interview interface for all job types
interface Interview {
  id: string;
  title: string; // Changed from 'role' to 'title' for any job field
  description?: string; // Added job description
  level: string;
  questions: string[];
  // REMOVED: techstack - not needed for all job types
  createdAt: string;
  userId: string;
  type: string; // Behavioral, Technical, Mixed, General
  finalized: boolean;
  amount: number; // Number of questions
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
}

// UPDATED: InterviewCardProps for all job types
interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  title: string; // Changed from 'role'
  type: string;
  level?: string; // Added level
  createdAt?: string;
  // REMOVED: techstack
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

// UPDATED: InterviewFormProps for all job types
interface InterviewFormProps {
  interviewId?: string; // Made optional for new interviews
  title: string; // Changed from 'role'
  description: string; // Job description/posting
  level: string;
  type: string;
  amount: number;
  // REMOVED: techstack
}

// REMOVED: TechIconProps - not needed for all job types

// ADDED: New types for form-based approach
interface CreateInterviewParams {
  title: string;
  description: string;
  level: string;
  amount: number;
  userid: string;
}

interface JobLevel {
  value: string;
  label: string;
}

interface InterviewType {
  value: string;
  label: string;
}