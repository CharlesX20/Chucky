import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center text-center">
        <h1 className="text-4xl font-bold">
          Interview Feedback -{" "}
          <span className="capitalize text-success-100">{interview.title}</span> Interview {/* Changed role to title */}
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5 flex-wrap justify-center">
          {/* Overall Score */}
          <div className="flex flex-row gap-2 items-center bg-dark-200 px-4 py-2 rounded-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <p className="font-bold">
              Overall Score: <span className="text-success-100">{feedback?.totalScore}/100</span>
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2 items-center bg-dark-200 px-4 py-2 rounded-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>

          {/* Level */}
          {interview.level && (
            <div className="flex flex-row gap-2 items-center bg-dark-200 px-4 py-2 rounded-lg">
              <span className="capitalize font-bold text-success-100">
                {interview.level} Level
              </span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-light-600" />

      {/* Final Assessment */}
      <div className="bg-dark-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-success-100">Final Assessment</h2>
        <p className="text-lg leading-7">{feedback?.finalAssessment}</p>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Interview Breakdown</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index} className="bg-dark-200 rounded-2xl p-6">
            <p className="font-bold text-lg mb-2">
              {index + 1}. {category.name} <span className="text-success-100">({category.score}/100)</span>
            </p>
            <p className="text-light-100">{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-dark-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-success-100">Strengths</h3>
          <ul className="list-disc list-inside space-y-2">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="text-light-100">{strength}</li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-dark-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-warning-100">Areas for Improvement</h3>
          <ul className="list-disc list-inside space-y-2">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="text-light-100">{area}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-bold text-center">
              Back to Dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-bold text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;