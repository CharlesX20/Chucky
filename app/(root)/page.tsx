import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getPublicInterviews,
  getAllInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center">
        <h2>Please sign in to access your interviews</h2>
        <Button asChild className="btn-primary mt-4">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Fetch data based on user role
  const [userInterviews, publicInterviews, allInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getPublicInterviews(20),
    user.role === 'admin' ? getAllInterviews(50) : Promise.resolve(null),
  ]);

  const hasUserInterviews = userInterviews && userInterviews.length > 0;
  const hasPublicInterviews = publicInterviews && publicInterviews.length > 0;
  const hasAllInterviews = allInterviews && allInterviews.length > 0;

  return (
    <>
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome back, {user.name}! {user.role === 'admin' && '👑'}
        </h1>
        <p className="text-lg text-light-100 max-w-2xl mx-auto">
          {user.role === 'admin' 
            ? "You have administrative access to manage all interviews in the system."
            : "Practice your interview skills with AI-powered mock interviews and get instant feedback."
          }
        </p>
      </section>

      {/* CTA Section */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>
            {user.role === 'admin' 
              ? "Manage Interview System"
              : "Get Interview-Ready with AI-Powered Practice & Feedback"
            }
          </h2>
          <p className="text-lg">
            {user.role === 'admin'
              ? "Monitor all interviews, manage users, and ensure quality content."
              : "Practice real interview questions & get instant feedback for any job field."
            }
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">
              {user.role === 'admin' ? "Create Template Interview" : "Start an Interview"}
            </Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* User's Interviews Section */}
      <section className="flex flex-col gap-6 mt-12">
        <div className="flex justify-between items-center">
          <h2>Your Interviews</h2>
          {hasUserInterviews && (
            <p className="text-light-400 text-sm">
              {userInterviews.length} interview{userInterviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="interviews-section">
          {hasUserInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user.id}
                interviewId={interview.id}
                title={interview.title}
                type={interview.type}
                level={interview.level}
                createdAt={interview.createdAt}
                isPublic={interview.isPublic}
                createdBy={user.name}
                showActions={true}
                isAdmin={user.role === 'admin'}
              />
            ))
          ) : (
            <div className="text-center w-full py-12">
              <div className="bg-dark-200 rounded-2xl p-8 max-w-md mx-auto">
                <svg className="w-12 h-12 text-light-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Interviews Yet</h3>
                <p className="text-light-400 mb-4">Create your first interview to get started with practice.</p>
                <Button asChild className="btn-primary">
                  <Link href="/interview">Create Interview</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Public Interviews Section */}
      {user.role !== 'admin' && (
        <section className="flex flex-col gap-6 mt-12">
          <div className="flex justify-between items-center">
            <h2>Community Interviews</h2>
            {hasPublicInterviews && (
              <p className="text-light-400 text-sm">
                {publicInterviews.length} public interview{publicInterviews.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          <div className="interviews-section">
            {hasPublicInterviews ? (
              publicInterviews
                .filter(interview => interview.userId !== user.id) // Don't show user's own interviews here
                .map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    userId={user.id}
                    interviewId={interview.id}
                    title={interview.title}
                    type={interview.type}
                    level={interview.level}
                    createdAt={interview.createdAt}
                    isPublic={interview.isPublic}
                    createdBy={interview.createdBy}
                    showActions={false} // No actions for other users' interviews
                  />
                ))
            ) : (
              <div className="text-center w-full py-8">
                <p className="text-light-400">No public interviews available yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Admin: All Interviews Section */}
      {user.role === 'admin' && hasAllInterviews && (
        <section className="flex flex-col gap-6 mt-12">
          <div className="flex justify-between items-center">
            <h2>All Interviews (Admin)</h2>
            <p className="text-light-400 text-sm">
              {allInterviews.length} total interview{allInterviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="interviews-section">
            {allInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user.id}
                interviewId={interview.id}
                title={interview.title}
                type={interview.type}
                level={interview.level}
                createdAt={interview.createdAt}
                isPublic={interview.isPublic}
                createdBy={interview.createdBy}
                showActions={true}
                isAdmin={true}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Home;