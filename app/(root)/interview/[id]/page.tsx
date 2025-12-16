import { redirect } from "next/navigation";
import Link from "next/link";

import Agent from "@/components/Agent";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  
  // Redirect if user is not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id, // Now guaranteed to be a string
  });

  return (
    <>
      <div className="max-sm:hidden flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            {/* REMOVED: Cover image as requested */}
            <h3 className="capitalize text-center">{interview.title} Interview</h3>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <p className="bg-success-100 text-white px-4 py-2 rounded-lg h-fit capitalize">
            {interview.type}
          </p>
          {interview.level && (
            <p className="bg-dark-200 text-white px-4 py-2 rounded-lg h-fit capitalize">
              {interview.level} Level
            </p>
          )}
        </div>
      </div>

      <Agent
        userName={user.name}
        userId={user.id} // Now guaranteed to be a string
        interviewId={id}
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;