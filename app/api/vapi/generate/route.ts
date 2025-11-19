import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    // Get current user from auth
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, level, amount } = await request.json();

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare professional interview questions for ANY job field.
        Job Title: ${title}
        Job Description: ${description}
        Experience Level: ${level}
        Number of Questions: ${amount}
        
        IMPORTANT INSTRUCTIONS:
        - Generate questions appropriate for the specific job title and level
        - Include a mix of behavioral, situational, and role-specific questions
        - Questions should be relevant to ANY industry or job field
        - Return ONLY the questions as a JSON array, no additional text
        - Format questions for voice assistant (no special characters like "/", "*" or any other special characters which might break the voice assistant.)
        - Questions should be clear, professional, and interview-appropriate
        
        Required Format:
        ["Question 1", "Question 2", "Question 3"]
    `,
    });

    const interview = {
      title: title,
      description: description,
      level: level,
      questions: JSON.parse(questions),
      userId: user.id, // Use authenticated user's ID
      finalized: true,
      type: "Mixed",
      createdAt: new Date().toISOString(),
    };

    // Add to Firestore
    await db.collection("interviews").add(interview);

    return Response.json({ 
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}