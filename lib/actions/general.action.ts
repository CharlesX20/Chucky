"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    console.log("=== CREATE FEEDBACK STARTED ===");
    console.log("Interview ID:", interviewId);
    console.log("User ID:", userId);
    console.log("Transcript length:", transcript.length);
    console.log("First few transcript messages:", transcript.slice(0, 3));

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("Calling Gemini for feedback generation...");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview for ANY job field. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Role-Specific Knowledge**: Understanding of key concepts and requirements for the specific job role.
        - **Problem-Solving**: Ability to analyze problems and propose relevant solutions.
        - **Cultural & Role Fit**: Alignment with professional values and job role expectations.
        - **Confidence & Clarity**: Confidence in responses, professional engagement, and message clarity.
        
        Provide constructive feedback that would help the candidate improve in real interviews for ANY job field.
        `,
      system:
        "You are a professional interviewer analyzing mock interviews for ALL job types. Your task is to evaluate candidates based on universal professional categories",
    });

    console.log("Gemini feedback generated:", object);

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    console.log("Feedback object to save:", feedback);

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
      console.log("Updating existing feedback:", feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
      console.log("Creating new feedback with ID:", feedbackRef.id);
    }

    await feedbackRef.set(feedback);
    console.log("Feedback saved successfully!");

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("=== CREATE FEEDBACK ERROR ===", error);
    return { success: false };
  }
}

// ... rest of the file remains exactly the same ...
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

// Update getLatestInterviews to use public interviews
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .where("isPublic", "==", true)
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// Add new functions

export async function getPublicInterviews(
  limit = 20
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("isPublic", "==", true)
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching public interviews:", error);
    return null;
  }
}

export async function deleteInterview(params: DeleteInterviewParams): Promise<{ success: boolean; error?: string }> {
  const { interviewId, userId, isAdmin = false } = params;

  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return { success: false, error: "Interview not found" };
    }

    const interview = interviewDoc.data() as Interview;

    // Check permissions: user owns the interview OR is admin
    if (interview.userId !== userId && !isAdmin) {
      return { success: false, error: "Unauthorized to delete this interview" };
    }

    await db.collection("interviews").doc(interviewId).delete();

    // Also delete associated feedback
    const feedbackQuery = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const deletePromises = feedbackQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error: "Failed to delete interview" };
  }
}

export async function updateInterviewVisibility(
  params: UpdateInterviewVisibilityParams
): Promise<{ success: boolean; error?: string }> {
  const { interviewId, userId, isPublic } = params;

  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return { success: false, error: "Interview not found" };
    }

    const interview = interviewDoc.data() as Interview;

    // Check if user owns the interview
    if (interview.userId !== userId) {
      return { success: false, error: "Unauthorized to update this interview" };
    }

    await db.collection("interviews").doc(interviewId).update({
      isPublic: isPublic
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating interview visibility:", error);
    return { success: false, error: "Failed to update visibility" };
  }
}


// Add these new functions to your existing file

export async function getAllInterviews(
  limit = 50
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching all interviews:", error);
    return null;
  }
}

export async function getUserById(
  params: GetUserByIdParams
): Promise<User | null> {
  const { userId } = params;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function updateUserRole(
  params: UpdateUserRoleParams
): Promise<{ success: boolean; error?: string }> {
  const { userId, role, adminUserId } = params;

  try {
    // Verify admin user exists and is actually an admin
    const adminUser = await db.collection("users").doc(adminUserId).get();
    if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Update the user's role
    await db.collection("users").doc(userId).update({
      role: role,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserId
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}