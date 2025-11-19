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
  isPublic?: boolean; // NEW: Public/private setting
  createdBy?: string; // NEW: User name for display
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
  role?: 'user' | 'admin'; // NEW: User roles
}

// UPDATED: InterviewCardProps for all job types - FIXED VERSION
interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  title: string; // Changed from 'role'
  type: string;
  level?: string; // Added level
  createdAt?: string;
  isPublic?: boolean; // NEW: Missing this
  createdBy?: string; // NEW: Missing this
  showActions?: boolean; // NEW: Missing this
  isAdmin?: boolean; // NEW: Missing this
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
  isPublic?: boolean; // NEW: Missing this
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
  isPublic?: boolean; // NEW: Missing this
}

interface JobLevel {
  value: string;
  label: string;
}

interface InterviewType {
  value: string;
  label: string;
}

// NEW: Admin action types
interface DeleteInterviewParams {
  interviewId: string;
  userId: string;
  isAdmin?: boolean;
}

// NEW: Update interview visibility
interface UpdateInterviewVisibilityParams {
  interviewId: string;
  userId: string;
  isPublic: boolean;
}

// NEW: Get user by ID for admin
interface GetUserByIdParams {
  userId: string;
}

// NEW: Update user role
interface UpdateUserRoleParams {
  userId: string;
  role: 'user' | 'admin';
  adminUserId: string; // The admin performing the action
}