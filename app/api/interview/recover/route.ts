import { NextRequest } from "next/server";
import { createFeedback } from "@/lib/actions/general.action";

/**
 * API route to recover interrupted interviews and generate feedback
 * from saved progress data
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== INTERVIEW RECOVERY API CALLED ===");
    
    const body = await request.json();
    console.log("Recovery request body:", { 
      interviewId: body.interviewId,
      userId: body.userId,
      messageCount: body.messages?.length 
    });
    
    const { messages, interviewId, userId, feedbackId } = body;
    
    // Validate required data
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ 
        success: false, 
        error: "Invalid or missing interview messages" 
      }, { status: 400 });
    }
    
    if (!interviewId || !userId) {
      return Response.json({ 
        success: false, 
        error: "Missing interview or user information" 
      }, { status: 400 });
    }
    
    // Generate feedback from recovered messages
    console.log(`Generating feedback from ${messages.length} recovered messages...`);
    
    const { success, feedbackId: newFeedbackId } = await createFeedback({
      interviewId,
      userId,
      transcript: messages,
      feedbackId,
    });
    
    if (success) {
      console.log("Recovery successful! Feedback ID:", newFeedbackId);
      return Response.json({ 
        success: true, 
        feedbackId: newFeedbackId,
        message: "Interview recovered and feedback generated successfully"
      });
    } else {
      console.error("Failed to generate feedback during recovery");
      return Response.json({ 
        success: false, 
        error: "Failed to generate feedback from recovered interview" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("=== RECOVERY API ERROR ===", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error during recovery" 
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ 
    success: true, 
    message: "Interview recovery API is running" 
  }, { status: 200 });
}