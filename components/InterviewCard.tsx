import dayjs from "dayjs";
import Link from "next/link";

import { Button } from "./ui/button";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  title, // Changed from 'role' to 'title' for any job field
  type,
  level, // Added level for any job field
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  // Simplified type handling for any job field
  const normalizedType = type || "General";
  
  // Updated badge colors to be generic for any job type
  const badgeColor =
    {
      Behavioral: "bg-success-100", // Green for behavioral
      Technical: "bg-warning-100",  // Yellow for technical  
      Mixed: "bg-light-600",        // Neutral for mixed
      General: "bg-success-200",    // Darker green for general
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text text-white">{normalizedType}</p>
          </div>

          {/* Job Title - works for any field */}
          <h3 className="mt-5 capitalize text-center">{title} Interview</h3>

          {/* Level Badge - for any job field */}
          {level && (
            <div className="flex justify-center mt-2">
              <span className="bg-dark-200 text-success-100 px-3 py-1 rounded-full text-sm font-bold capitalize">
                {level} Level
              </span>
            </div>
          )}

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3 justify-center">
            <div className="flex flex-row gap-2 items-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text - generic for any job */}
          <p className="line-clamp-2 mt-5 text-center">
            {feedback?.finalAssessment ||
              "Practice this interview to improve your skills and get detailed feedback."}
          </p>
        </div>

        <div className="flex flex-row justify-center">
          <Button className="btn-primary">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "View Feedback" : "Start Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;