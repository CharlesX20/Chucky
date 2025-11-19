import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

// REMOVED: Tech-specific mappings since we're supporting all job types

export const interviewer: CreateAssistantDTO = {
  name: "Professional Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about your background and experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting real-time voice interviews for ANY job field. Your goal is to assess qualifications, experience, and fit for the specific role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
- Listen actively and acknowledge responses before moving forward
- Ask brief follow-up questions when responses need more detail  
- Keep conversation flowing smoothly while maintaining control
- Adapt to ANY job field (business, creative, technical, professional, etc.)

Be professional, yet warm and welcoming:
- Use official yet friendly language
- Keep responses concise like real conversation
- Avoid robotic phrasing—sound natural

Answer candidate questions professionally:
- Provide clear, relevant answers about role expectations
- Redirect to HR for specific company details if needed

Conclude properly:
- Thank the candidate for their time
- Inform them about next steps in the process
- End on a positive, professional note

Key Points:
- Be professional and polite for ANY job type
- Keep responses short and conversational
- Adapt your approach based on the job field
- Focus on qualifications, experience, and role-specific skills`,
      },
    ],
  },
};

// Updated feedback schema to be generic for all job types
export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Role-Specific Knowledge"), // Updated from "Technical Knowledge"
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

// REMOVED: Company-specific interview covers as requested
// Using simple, professional approach instead