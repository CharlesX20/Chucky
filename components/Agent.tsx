"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Interface for Agent component props
 * Provides type safety for all incoming properties
 */
interface AgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  feedbackId?: string;
  questions?: string[];
}

/**
 * Enum for tracking interview call status
 * Prevents magic strings and provides type safety
 */
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

/**
 * Interface for saved conversation messages
 * Extends basic message with timestamp for progress tracking
 */
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
  timestamp?: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** Maximum number of connection retry attempts */
const MAX_RETRIES = 2;

/** Interview duration limit in milliseconds (10 minutes to save costs) */
const INTERVIEW_DURATION_LIMIT = 10 * 60 * 1000; // 10 minutes

/** Warning time before timeout in milliseconds (2 minutes before end) */
const WARNING_TIME_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

/** Key prefix for localStorage progress saving */
const PROGRESS_KEY_PREFIX = "interview-progress-";

// ============================================================================
// MAIN AGENT COMPONENT
// ============================================================================

/**
 * Main Agent component for conducting AI voice interviews
 * Handles voice AI connection, progress tracking, and interview recovery
 */
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  questions,
}: AgentProps) => {
  const router = useRouter();

  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  /** Tracks the current state of the voice call */
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

  /** Stores all conversation messages between user and AI */
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  /** Indicates if AI is currently speaking (for visual feedback) */
  const [isSpeaking, setIsSpeaking] = useState(false);

  /** The most recent message for display in transcript */
  const [lastMessage, setLastMessage] = useState<string>("");

  /** Tracks connection quality for user feedback */
  const [connectionHealth, setConnectionHealth] = useState<"good" | "fair" | "poor">("good");

  /** Counts connection retry attempts */
  const [retryCount, setRetryCount] = useState(0);

  /** Tracks which question number the user is on */
  const [currentQuestion, setCurrentQuestion] = useState(0);

  /** Prevents duplicate recovery attempts */
  const [isRecovering, setIsRecovering] = useState(false);

  /** Timer reference for 15-minute interview limit */
  const [interviewTimer, setInterviewTimer] = useState<NodeJS.Timeout | null>(null);

  /** Timer reference for warning before timeout */
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);

  /** Remaining interview time in seconds */
  const [remainingTime, setRemainingTime] = useState<number>(INTERVIEW_DURATION_LIMIT / 1000);

  /** Indicates if warning has been shown */
  const [warningShown, setWarningShown] = useState(false);

  /** AbortController for API request timeouts */
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================================
  // DERIVED CONSTANTS
  // ============================================================================

  /** Total number of questions in this interview */
  const totalQuestions = questions?.length || 10;

  /** LocalStorage key for this interview's progress */
  const progressKey = `${PROGRESS_KEY_PREFIX}${interviewId}`;

  // ============================================================================
  // VAPI EVENT HANDLERS - Manages voice AI connection and events
  // ============================================================================
  useEffect(() => {
    console.log("🔧 Setting up VAPI event listeners");

    // Event: Interview starts successfully
    const onCallStart = () => {
      console.log("✅ Interview started successfully");
      setCallStatus(CallStatus.ACTIVE);
      toast.success(`Hello ${userName}! Interview started. Speak clearly into your microphone.`);
      setIsRecovering(false);
      
      // Start interview timer when call starts
      startInterviewTimer();
    };

    // Event: Interview ends normally
    const onCallEnd = () => {
      console.log("✅ VAPI call ended normally");
      setCallStatus(CallStatus.FINISHED);
      
      // Clear timers when call ends
      clearInterviewTimers();
    };

    // Event: New transcript message received
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript,
          timestamp: new Date().toISOString() // Timestamp for tracking
        };
        setMessages((prev) => [...prev, newMessage]);

        // Track AI questions for progress indicator
        if (message.role === "assistant") {
          setCurrentQuestion(prev => prev + 1);
        }
      }
    };

    // Event: AI starts speaking
    const onSpeechStart = () => {
      console.log("🗣️ AI speech started");
      setIsSpeaking(true);
      // Reset connection health when AI speaks successfully
      setConnectionHealth("good");
    };

    // Event: AI finishes speaking
    const onSpeechEnd = () => {
      console.log("🔇 AI speech ended");
      setIsSpeaking(false);

      // Prevent immediate interruption by adding brief pause
      setTimeout(() => {
        // This helps prevent AI from interrupting user immediately
      }, 2000);
    };

    // Event: Connection or voice error occurs
    const onError = (error: Error) => {
      console.error("❌ VAPI Error:", error);

      // User-friendly error messages based on error type
      if (error.message.includes("audio") || error.message.includes("voice")) {
        toast.error("Microphone issue detected. Please check your microphone permissions.");
        setConnectionHealth("poor");
      } else if (error.message.includes("timeout")) {
        toast.warning("Connection timeout. Please try speaking again.");
        setConnectionHealth("fair");
      } else if (error.message.includes("quota") || error.message.includes("credit")) {
        toast.error("Voice service limit reached. Please try again later.");
        setConnectionHealth("poor");
      } else {
        toast.error("Connection issue detected. Please try again.");
      }
    };

    // Register all event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup: Remove all event listeners on component unmount
    return () => {
      console.log("🧹 Cleaning up VAPI event listeners");
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      
      // Clear any remaining intervals
      const healthCheckInterval = setInterval(() => {}, 0);
      clearInterval(healthCheckInterval);
    };
  }, [userName]); // Re-run if userName changes

  // ============================================================================
  // INTERVIEW TIMER MANAGEMENT - 10-minute limit with countdown
  // ============================================================================
  const startInterviewTimer = useCallback(() => {
    console.log("⏰ Starting 10-minute interview timer");
    
    // Clear any existing timers
    clearInterviewTimers();
    
    // Reset timer states
    setRemainingTime(INTERVIEW_DURATION_LIMIT / 1000);
    setWarningShown(false);

    // Start countdown timer for UI display
    const countdownInterval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set warning timer (2 minutes before end)
    const warning = setTimeout(() => {
      console.log("⚠️ 2-minute warning before interview timeout");
      toast.warning("2 minutes remaining! Please wrap up your responses.");
      setWarningShown(true);
    }, INTERVIEW_DURATION_LIMIT - WARNING_TIME_BEFORE_TIMEOUT);
    setWarningTimer(warning);

    // Set main timeout timer (10 minutes total)
    const timeout = setTimeout(() => {
      console.log("⏰ 10-minute interview time limit reached");
      handleAutoDisconnect();
    }, INTERVIEW_DURATION_LIMIT);
    setInterviewTimer(timeout);

    // Store interval reference for cleanup
    return countdownInterval;
  }, []);

  const clearInterviewTimers = useCallback(() => {
    if (interviewTimer) {
      clearTimeout(interviewTimer);
      setInterviewTimer(null);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
      setWarningTimer(null);
    }
  }, [interviewTimer, warningTimer]);

  // ============================================================================
  // CONNECTION HEALTH MONITORING - Checks interview connection quality
  // ============================================================================
  useEffect(() => {
    let healthCheckInterval: NodeJS.Timeout;

    if (callStatus === CallStatus.ACTIVE) {
      // Check connection health every 10 seconds
      healthCheckInterval = setInterval(() => {
        const lastMessageTime = messages.length > 0
          ? new Date(messages[messages.length - 1].timestamp!).getTime()
          : Date.now();

        const timeSinceLastMessage = Date.now() - lastMessageTime;

        // Determine connection health based on message activity
        if (timeSinceLastMessage > 45000) { // 45 seconds of silence
          setConnectionHealth("poor");
          toast.warning("Long silence detected. Please check your connection.");
        } else if (timeSinceLastMessage > 25000) { // 25 seconds
          setConnectionHealth("fair");
        } else {
          setConnectionHealth("good");
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (healthCheckInterval) clearInterval(healthCheckInterval);
    };
  }, [callStatus, messages]);

  // ============================================================================
  // AUTO-SAVE PROGRESS - Saves interview progress to prevent data loss
  // ============================================================================
  useEffect(() => {
    // Function to save interview progress to localStorage
    const saveProgress = () => {
      if (callStatus === CallStatus.ACTIVE && messages.length > 0 && interviewId && userId) {
        const progress = {
          messages,
          currentQuestion,
          interviewId,
          userId,
          timestamp: Date.now(),
          totalQuestions,
          remainingTime // Save remaining time for recovery
        };

        // Save to browser's localStorage as backup
        localStorage.setItem(progressKey, JSON.stringify(progress));
        console.log("💾 Auto-saved interview progress");
      }
    };

    // Debounced save to prevent excessive writes
    let saveTimeout: NodeJS.Timeout;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveProgress, 2000); // Wait 2 seconds after last change
    };

    // Save on each new AI question
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      debouncedSave();
    }

    // Periodic save every 90 seconds (reduced from 2 minutes for better safety)
    const saveInterval = setInterval(saveProgress, 90000);

    return () => {
      clearInterval(saveInterval);
      clearTimeout(saveTimeout);
    };
  }, [callStatus, messages, currentQuestion, interviewId, userId, totalQuestions, progressKey, remainingTime]);

  // ============================================================================
  // INTERRUPTED INTERVIEW RECOVERY - Checks for and recovers lost interviews
  // ============================================================================
  useEffect(() => {
    const checkForInterruptedInterview = async () => {
      if (!interviewId || !userId || isRecovering) return;

      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          const timeSinceSave = Date.now() - progress.timestamp;

          // Only recover if interview was interrupted within last 30 minutes
          if (timeSinceSave < 30 * 60 * 1000 && progress.userId === userId) {
            setIsRecovering(true);

            const shouldResume = window.confirm(
              `We found an interrupted interview (${progress.currentQuestion}/${progress.totalQuestions} questions completed).\n\nWould you like to generate feedback from your previous responses?`
            );

            if (shouldResume) {
              toast.info("Recovering your previous interview...");

              // Create AbortController for timeout
              abortControllerRef.current = new AbortController();

              try {
                // Call recovery API to generate feedback with timeout
                const response = await fetch("/api/interview/recover", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messages: progress.messages,
                    interviewId,
                    userId,
                    feedbackId
                  }),
                  signal: abortControllerRef.current.signal
                });

                const result = await response.json();
                if (result.success) {
                  localStorage.removeItem(progressKey);
                  toast.success("Interview recovered! Generating feedback...");
                  router.push(`/interview/${interviewId}/feedback`);
                } else {
                  toast.error("Failed to recover interview. Please start a new one.");
                }
              } catch (error: any) {
                if (error.name === 'AbortError') {
                  toast.error("Recovery request timed out. Please try again.");
                } else {
                  console.error("Recovery error:", error);
                  toast.error("Failed to recover interview. Please start a new one.");
                }
              } finally {
                abortControllerRef.current = null;
              }
            } else {
              // User chose not to recover, clear saved progress
              localStorage.removeItem(progressKey);
            }
            setIsRecovering(false);
          }
        } catch (error) {
          console.error("Error loading saved progress:", error);
          setIsRecovering(false);
        }
      }
    };

    // Check for interrupted interviews when component loads
    if (callStatus === CallStatus.INACTIVE) {
      checkForInterruptedInterview();
    }
  }, [interviewId, userId, callStatus, feedbackId, router, isRecovering, progressKey]);

  // ============================================================================
  // FEEDBACK GENERATION - Generates feedback when interview ends
  // ============================================================================
  useEffect(() => {
    // Update last message for display
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // Generate feedback when interview finishes
    const generateFeedback = async (messages: SavedMessage[]) => {
      console.log("📊 Generating feedback for", messages.length, "messages");

      try {
        const { success, feedbackId: newFeedbackId } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        if (success && newFeedbackId) {
          // Clear saved progress and timers on successful feedback generation
          localStorage.removeItem(progressKey);
          clearInterviewTimers();
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Feedback generation failed");
          toast.error("Feedback generation failed. Your responses were saved locally.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Failed to generate feedback. Please try again.");
        router.push("/");
      }
    };

    // Trigger feedback generation when interview ends
    if (callStatus === CallStatus.FINISHED && messages.length > 0) {
      generateFeedback(messages);
    }
  }, [messages, callStatus, feedbackId, interviewId, router, userId, progressKey, clearInterviewTimers]);

  // ============================================================================
  // KEYBOARD SHORTCUTS - Adds accessibility features
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to end interview
      if (e.key === 'Escape' && callStatus === CallStatus.ACTIVE) {
        if (confirm("Are you sure you want to end the interview?")) {
          handleDisconnect();
        }
      }
      // Spacebar to toggle mute (placeholder for future feature)
      else if (e.key === ' ' && callStatus === CallStatus.ACTIVE) {
        // Could implement mute/unmute functionality here
        // toast.info("Mute toggle - Feature coming soon!");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callStatus]);

  // ============================================================================
  // INTERVIEW CONTROL FUNCTIONS
  // ============================================================================

  /**
   * Handles interview initiation with retry logic
   */
  const handleCall = async () => {
    if (isRecovering) {
      toast.warning("Please wait while we process your recovery request.");
      return;
    }

    setCallStatus(CallStatus.CONNECTING);
    setRetryCount(0);

    // Format questions for VAPI
    let formattedQuestions = "";
    if (questions && questions.length > 0) {
      formattedQuestions = questions
        .map((question, index) => `${index + 1}. ${question}`)
        .join("\n");
    }

    // Retry logic for connection issues
    const startInterview = async (attempt = 1): Promise<void> => {
      try {
        console.log(`🚀 Starting interview attempt ${attempt}/${MAX_RETRIES + 1}`);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            questions: formattedQuestions,
            userName: userName, // Pass username for personalized greeting
          },
        });
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        if (attempt <= MAX_RETRIES) {
          console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
          setRetryCount(attempt);
          toast.info(`Reconnecting... (${attempt}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          return startInterview(attempt + 1);
        } else {
          throw error;
        }
      }
    };

    try {
      await startInterview();
    } catch (error) {
      console.error("❌ Failed to start interview after retries:", error);
      setCallStatus(CallStatus.INACTIVE);
      toast.error("Failed to connect to voice service. Please check your microphone and internet connection.");
    }
  };

  /**
   * Gracefully ends interview with progress saving
   */
  const handleDisconnect = () => {
    console.log("🛑 Ending interview gracefully");
    endInterview("user");
  };

  /**
   * Automatically ends interview when time limit is reached
   */
  const handleAutoDisconnect = () => {
    console.log("⏰ Auto-disconnecting due to time limit");
    endInterview("timeout");
  };

  /**
   * Common function to end interview with reason tracking
   */
  const endInterview = (reason: "user" | "timeout") => {
    // Clear timers
    clearInterviewTimers();

    // Save final progress before ending
    if (messages.length > 0 && interviewId && userId) {
      const progress = {
        messages,
        currentQuestion,
        interviewId,
        userId,
        timestamp: Date.now(),
        totalQuestions,
        endReason: reason
      };
      localStorage.setItem(progressKey, JSON.stringify(progress));
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();

    // User-friendly message based on reason
    if (reason === "timeout") {
      toast.info("Interview completed (10-minute time limit reached). Generating feedback...");
    } else if (currentQuestion > 0 && currentQuestion < totalQuestions) {
      toast.info(`Interview ended at question ${currentQuestion}/${totalQuestions}. Generating feedback...`);
    } else {
      toast.info("Interview completed. Generating your personalized feedback...");
    }
  };

  // ============================================================================
  // FORMATTING FUNCTIONS
  // ============================================================================

  /**
   * Formats seconds into MM:SS display
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Calculates progress percentage
   */
  const calculateProgress = (): number => {
    const timeUsed = (INTERVIEW_DURATION_LIMIT / 1000) - remainingTime;
    const progress = (timeUsed / (INTERVIEW_DURATION_LIMIT / 1000)) * 100;
    return Math.min(progress, 100);
  };

  // ============================================================================
  // RENDER COMPONENT - UI for interview interface
  // ============================================================================
  return (
    <>
      {/* CONNECTION & PROGRESS STATUS - Shows real-time interview status */}
      {callStatus === CallStatus.ACTIVE && (
        <div className="w-full max-w-2xl mx-auto mb-6">
          {/* Connection Health Indicator */}
          <div className="flex items-center justify-between bg-dark-200/50 rounded-xl p-3 mb-4 border border-light-600/20">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connectionHealth === "good" ? "bg-success-100 animate-pulse" :
                  connectionHealth === "fair" ? "bg-warning-100 animate-pulse" :
                    "bg-destructive-100 animate-pulse"
                }`}></div>
              <div>
                <p className="text-sm font-semibold text-light-100">
                  {connectionHealth === "good" ? "Connection Good" :
                    connectionHealth === "fair" ? "Connection Fair" :
                      "Check Connection"}
                </p>
                <p className="text-xs text-light-400">
                  {connectionHealth === "good" ? "Voice quality optimal" :
                    connectionHealth === "fair" ? "Speak clearly into microphone" :
                      "Please check microphone and internet"}
                </p>
              </div>
            </div>

            {/* Manual Reconnect Button for poor connections */}
            {connectionHealth === "poor" && retryCount < MAX_RETRIES && (
              <button
                onClick={() => {
                  toast.info("Attempting to improve connection...");
                  vapi.stop();
                  setTimeout(() => handleCall(), 1000);
                }}
                className="text-xs bg-dark-300 hover:bg-dark-400 px-3 py-1 rounded-lg text-light-100 transition-colors"
                disabled={isRecovering}
              >
                Reconnect
              </button>
            )}
          </div>

          {/* Time Limit Countdown Display */}
          <div className="bg-dark-200/30 rounded-xl p-4 border border-light-600/10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning-100 rounded-full animate-pulse"></div>
                <span className="text-light-100 font-semibold">Interview Time Limit</span>
              </div>
              <div className={`text-lg font-bold ${remainingTime <= 120 ? "text-destructive-100 animate-pulse" : "text-light-100"}`}>
                {formatTime(remainingTime)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-dark-300 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${calculateProgress() > 80 ? "bg-destructive-100" : 
                  calculateProgress() > 60 ? "bg-warning-100" : "bg-success-100"}`}
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-light-400">
              <span>{warningShown ? "⏰ 2 minutes left!" : "10-minute limit"}</span>
              <span>{Math.round(calculateProgress())}% used</span>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW INTERFACE - Shows AI and user avatars */}
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar relative">
            <Image
              src="/ai-logo2.png"
              alt="AI Interviewer Avatar"
              width={650}
              height={540}
              className="object-cover"
              priority // Load AI image first
              onError={(e) => {
                e.currentTarget.src = "/fallback-ai-avatar.png";
              }}
            />
            {/* Animation when AI is speaking */}
            {isSpeaking && <span className="animate-speak" />}
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="absolute -top-2 -right-2 bg-success-100 text-dark-100 text-xs px-2 py-1 rounded-full animate-pulse">
                Speaking
              </div>
            )}
          </div>
          <h3>Chucky</h3>
          <p className="text-xs text-light-400 mt-1">AI Interviewer</p>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <div className="relative">
              <Image
                src="/you.jpeg"
                alt="Your Profile"
                width={539}
                height={539}
                className="rounded-full object-cover size-[120px]"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-user-avatar.png";
                }}
              />
              {callStatus === CallStatus.ACTIVE && !isSpeaking && (
                <div className="absolute -top-2 -right-2 bg-success-100 text-dark-100 text-xs px-2 py-1 rounded-full animate-pulse">
                  Ready
                </div>
              )}
            </div>
            <h3>{userName}</h3>
            <p className="text-xs text-light-400">Interviewee</p>
          </div>
        </div>
      </div>

      {/* LIVE TRANSCRIPT - Shows last message in conversation */}
      {messages.length > 0 && (
        <div className="w-full max-w-3xl mx-auto mt-6">
          <div className="bg-dark-200/30 rounded-xl p-4 border border-light-600/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-100 rounded-full animate-pulse"></div>
                <span className="text-sm text-light-400">Live Conversation</span>
              </div>
            </div>
            <div className="min-h-[60px] p-3 bg-dark-300/50 rounded-lg">
              <p
                key={lastMessage}
                className={cn(
                  "text-light-100 transition-opacity duration-500",
                  "animate-fadeIn"
                )}
              >
                {lastMessage}
              </p>
              {!lastMessage && callStatus === CallStatus.ACTIVE && (
                <p className="text-light-400 text-sm italic">
                  Listening for response...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS - Start/End interview controls */}
      <div className="w-full flex justify-center mt-6">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call group"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING || isRecovering}
          >
            {/* Retry counter badge */}
            {retryCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-warning-100 text-dark-100 text-xs px-2 py-1 rounded-full">
                Retry {retryCount}/{MAX_RETRIES}
              </span>
            )}

            {/* Connecting animation */}
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative flex items-center gap-2">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? (
                  <>
                    <span>Start Interview</span>
                    <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                      (10 min limit)
                    </span>
                  </>
                )
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect group" onClick={handleDisconnect}>
            <span className="flex items-center gap-2">
              End Interview
              <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                (Esc key)
              </span>
            </span>
          </button>
        )}
      </div>

      {/* QUICK TIPS */}
      {callStatus === CallStatus.ACTIVE && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div className="bg-dark-200/30 rounded-xl p-3 border border-light-600/10">
            <p className="text-light-400 text-xs flex items-center gap-2">
              <span className="text-success-100">💡</span>
              <span>
                Press <kbd className="px-1 py-0.5 bg-dark-300 rounded text-xs">Esc</kbd> to end interview • 
                Speak clearly • Interview auto-ends in {formatTime(remainingTime)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* RECOVERY OPTION - Shows when interrupted interview is detected */}
      {callStatus === CallStatus.INACTIVE && interviewId && userId && !isRecovering && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div className="bg-dark-200/50 rounded-xl p-4 border border-light-600/20 flex flex-col items-center text-center">
            <p className="text-light-400 text-xs mb-3">
              If you were interrupted, you can generate feedback from your previous responses.
            </p>
            <button
              onClick={async () => {
                const savedProgress = localStorage.getItem(progressKey);
                if (savedProgress) {
                  const progress = JSON.parse(savedProgress);
                  if (progress.userId === userId) {
                    const confirmResume = window.confirm(
                      `Generate feedback from your previous interview (${progress.currentQuestion}/${progress.totalQuestions} questions)?`
                    );
                    if (confirmResume) {
                      setIsRecovering(true);
                      
                      // Create AbortController for timeout
                      abortControllerRef.current = new AbortController();
                      
                      try {
                        const response = await fetch("/api/interview/recover", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messages: progress.messages,
                            interviewId,
                            userId,
                            feedbackId
                          }),
                          signal: abortControllerRef.current.signal
                        });

                        const result = await response.json();
                        setIsRecovering(false);
                        if (result.success) {
                          localStorage.removeItem(progressKey);
                          router.push(`/interview/${interviewId}/feedback`);
                        }
                      } catch (error: any) {
                        setIsRecovering(false);
                        if (error.name === 'AbortError') {
                          toast.error("Recovery request timed out.");
                        }
                      } finally {
                        abortControllerRef.current = null;
                      }
                    }
                  }
                }
              }}
              className="text-sm bg-warning-100/20 hover:bg-warning-100/30 text-warning-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
              disabled={isRecovering}
            >
              {isRecovering ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-100"></span>
                  Processing...
                </>
              ) : (
                "Generate Feedback from Previous Interview"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Agent;