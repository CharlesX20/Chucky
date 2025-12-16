import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API CALL STARTED ===");

    // Get current user from auth
    const user = await getCurrentUser();
    console.log("User:", user);

    if (!user) {
      console.log("No user found");
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const { title, description, level, amount, type, isPublic = false } = body;

    // Validate required fields
    if (!title || !description || !level || !amount || !type) {
      console.log("Missing fields:", { title, description, level, amount });
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // backend description validation
    if (description.length > 4000) {
      return Response.json({
        success: false,
        error: `Job description too long (${description.length}/4000 characters). Please shorten it.`
      }, { status: 400 });
    }

    console.log("Calling Gemini...");

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare professional interview questions for ANY job field.
        Job Title: ${title}
        Job Description: ${description}
        Experience Level: ${level}
        Interview Type: ${type}
        Number of Questions: ${amount}
        
        IMPORTANT INSTRUCTIONS:
        - Generate questions appropriate for the specific job title and level
        - For ${type} interviews, focus on ${type.toLowerCase()} questions
        - Include a mix of behavioral, situational, and role-specific questions
        - Questions should be relevant to ANY industry or job field
        - Return ONLY the questions as a JSON array, no additional text
        - Format questions for voice assistant (no special characters like "/", "*" or any other special characters which might break the voice assistant.)
        - Questions should be clear, professional, and interview-appropriate
        - DO NOT use markdown formatting or backticks
        - Return ONLY valid JSON array format
        
        Required Format:
        ["Question 1", "Question 2", "Question 3"]
    `,
    });

    console.log("Gemini response:", questions);

    // FIX: Clean the response before parsing
    let cleanedQuestions = questions.trim();

    // Remove markdown code blocks if present
    if (cleanedQuestions.startsWith('```json')) {
      cleanedQuestions = cleanedQuestions.slice(7); // Remove ```json
    }
    if (cleanedQuestions.startsWith('```')) {
      cleanedQuestions = cleanedQuestions.slice(3); // Remove ```
    }
    if (cleanedQuestions.endsWith('```')) {
      cleanedQuestions = cleanedQuestions.slice(0, -3); // Remove ```
    }

    cleanedQuestions = cleanedQuestions.trim();

    console.log("Cleaned questions:", cleanedQuestions);

    const parsedQuestions = JSON.parse(cleanedQuestions);

    const interview = {
      title: title,
      description: description,
      level: level,
      questions: parsedQuestions,
      userId: user.id,
      createdBy: user.name, // NEW: Store creator name
      finalized: true,
      type: type,
      isPublic: isPublic, // NEW: Public/private setting
      amount: amount,
      createdAt: new Date().toISOString(),
    };

    console.log("Saving to Firebase...");

    // Add to Firestore
    await db.collection("interviews").add(interview);

    console.log("=== API CALL SUCCESS ===");

    return Response.json({
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error("=== API ERROR ===", error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}