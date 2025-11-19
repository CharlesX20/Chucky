"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { useState, useEffect } from "react"; // ← Add useEffect import
import { toast } from "sonner";

import { Button } from "./ui/button";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId, deleteInterview, updateInterviewVisibility } from "@/lib/actions/general.action";

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  title: string;
  type: string;
  level?: string;
  createdAt?: string;
  isPublic?: boolean;
  createdBy?: string;
  showActions?: boolean;
  isAdmin?: boolean;
}


const InterviewCard = ({
  interviewId,
  userId,
  title,
  type,
  level,
  createdAt,
  isPublic = false,
  createdBy,
  showActions = true,
  isAdmin = false,
}: InterviewCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  // FIX: Replace useState with useEffect for side effects
  useEffect(() => {
    const loadFeedback = async () => {
      if (userId && interviewId) {
        try {
          const feedbackData = await getFeedbackByInterviewId({
            interviewId,
            userId,
          });
          setFeedback(feedbackData);
        } catch (error) {
          console.error("Error loading feedback:", error);
        }
      }
    };
    loadFeedback();
  }, [userId, interviewId]); // ← Add dependencies


const normalizedType = type || "General";

// FIX: Use lowercase keys and convert normalizedType to lowercase
const badgeColor =
  {
    behavioral: "bg-success-100",
    technical: "bg-warning-100",  
    mixed: "bg-light-600",
    general: "bg-success-200",
  }[normalizedType.toLowerCase()] || "bg-light-600";

  console.log('Interview Card Props:', { title, type, normalizedType });
  console.log('Selected badge color:', badgeColor, 'for type:', normalizedType);

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const handleDelete = async () => {
    if (!interviewId || !userId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteInterview({
        interviewId,
        userId,
        isAdmin
      });

      if (result.success) {
        toast.success("Interview deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete interview");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!interviewId || !userId) return;
    
    setIsUpdating(true);
    try {
      const result = await updateInterviewVisibility({
        interviewId,
        userId,
        isPublic: !isPublic
      });

      if (result.success) {
        toast.success(`Interview is now ${!isPublic ? 'public' : 'private'}`);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge & Public Badge */}
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "w-fit px-4 py-2 rounded-bl-lg rounded-tr-lg",
                badgeColor
              )}
            >
              <p className="badge-text text-white">{normalizedType}</p>
            </div>
            
            {/* Public/Private Badge */}
            {showActions && (
              <div className={cn(
                "w-fit px-3 py-1 rounded-full text-xs font-bold",
                isPublic ? "bg-success-100/20 text-success-100" : "bg-light-600/50 text-light-400"
              )}>
                {isPublic ? "Public" : "Private"}
              </div>
            )}
          </div>

          {/* Created By (for public interviews) */}
          {createdBy && (
            <div className="mb-2">
              <p className="text-light-400 text-sm">
                Created by: <span className="text-success-100 font-semibold">{createdBy}</span>
              </p>
            </div>
          )}

          {/* Job Title */}
          <h3 className="mt-2 capitalize text-center">{title} Interview</h3>

          {/* Level Badge */}
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

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5 text-center">
            {feedback?.finalAssessment ||
              "Practice this interview to improve your skills and get detailed feedback."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Action Buttons */}
          {showActions && userId && (
            <div className="flex flex-col gap-2">
              {/* Visibility Toggle */}
              <Button
                onClick={handleToggleVisibility}
                disabled={isUpdating}
                className="btn-secondary text-sm py-2"
                size="sm"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  `Make ${isPublic ? 'Private' : 'Public'}`
                )}
              </Button>
              
              {/* Delete Button */}
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-warning text-sm py-2"
                size="sm"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete Interview"
                )}
              </Button>
            </div>
          )}

          {/* Start Interview Button */}
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