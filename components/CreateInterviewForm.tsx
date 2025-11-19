"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

// Form validation schema
const interviewFormSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  description: z.string().min(10, "Please provide a detailed job description (minimum 10 characters)"),
  level: z.enum(["entry", "junior", "mid", "senior", "executive"]),
  type: z.enum(["Behavioral", "Technical", "Mixed", "General"]),
  amount: z.number().min(3).max(20),
  isPublic: z.boolean(), // NEW: Public/private toggle
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

const CreateInterviewForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "mid",
      type: "Mixed",
      amount: 10,
      isPublic: false,
    },
  });

  const onSubmit = async (data: InterviewFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("🎉 Interview created successfully!");
        form.reset();
        router.refresh();
        router.push("/");
      } else {
        toast.error("❌ Failed to create interview. Please try again.");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("💥 An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="w-full min-h-screen bg-dark-100 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto w-full">
      {/* Header Section */}
      <div className="text-center mb-8 px-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100/20 rounded-full mb-4">
          <svg className="w-8 h-8 text-success-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
          Create Custom Interview
        </h1>
        <p className="text-base sm:text-lg text-light-100 max-w-2xl mx-auto leading-relaxed px-2">
          Fill in the job details below and we'll generate tailored interview questions specifically for your role. 
          Perfect for any job field - from tech to marketing, sales to design.
        </p>
      </div>

      {/* Back Button */}
      <div className="flex justify-start mb-6 px-2">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-light-100 hover:text-success-100 transition-colors font-semibold group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Form Card */}
      <div className="card-border w-full max-w-2xl mx-auto">
        <div className="dark-gradient rounded-2xl p-4 sm:p-6 lg:p-8 w-full"> {/* Changed .card to dark-gradient */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                label="Job Title *"
                placeholder="e.g., Marketing Manager, Software Engineer, Sales Representative, Graphic Designer"
                type="text"
              />

              {/* Job Description - TEXTAREA */}
              <div>
                <label className="label block mb-3 text-lg font-semibold text-light-100">
                  Job Description *
                </label>
                <textarea
                  {...form.register("description")}
                  placeholder="Paste the full job posting or describe the role, responsibilities, required skills, and qualifications. The more detail you provide, the better our AI can generate relevant questions."
                  rows={6}
                  className="w-full bg-dark-200 rounded-2xl px-5 py-4 placeholder:text-light-400 text-light-100 border border-light-600/30 focus:border-success-100/50 focus:ring-2 focus:ring-success-100/20 transition-all duration-300 resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-destructive-100 text-sm mt-2 ml-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
                <p className="text-sm text-light-400 mt-2 ml-1">
                  Provide detailed information for better question generation
                </p>
              </div>

              {/* Experience Level & Interview Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label block mb-3 text-lg font-semibold text-light-100">
                    Experience Level
                  </label>
                  <select
                    {...form.register("level")}
                    className="w-full bg-dark-200 rounded-2xl px-5 py-4 text-light-100 border border-light-600/30 focus:border-success-100/50 focus:ring-2 focus:ring-success-100/20 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="entry" className="bg-dark-200 text-light-100">Entry Level</option>
                    <option value="junior" className="bg-dark-200 text-light-100">Junior</option>
                    <option value="mid" className="bg-dark-200 text-light-100">Mid Level</option>
                    <option value="senior" className="bg-dark-200 text-light-100">Senior</option>
                    <option value="executive" className="bg-dark-200 text-light-100">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="label block mb-3 text-lg font-semibold text-light-100">
                    Interview Type
                  </label>
                  <select
                    {...form.register("type")}
                    className="w-full bg-dark-200 rounded-2xl px-5 py-4 text-light-100 border border-light-600/30 focus:border-success-100/50 focus:ring-2 focus:ring-success-100/20 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="Behavioral" className="bg-dark-200 text-light-100">Behavioral</option>
                    <option value="Technical" className="bg-dark-200 text-light-100">Technical</option>
                    <option value="Mixed" className="bg-dark-200 text-light-100">Mixed</option>
                    <option value="General" className="bg-dark-200 text-light-100">General</option>
                  </select>
                </div>
              </div>

              {/* Number of Questions Slider */}
              <div className="bg-dark-200/80 rounded-2xl p-6 border border-light-600/20">
                <label className="label block mb-4 text-lg font-semibold text-light-100">
                  Number of Questions: <span className="text-success-100">{form.watch("amount")}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  {...form.register("amount", { valueAsNumber: true })}
                  className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer slider accent-success-100"
                />
                <div className="flex justify-between text-sm text-light-100 mt-3 font-semibold">
                  <span>3 (Quick Practice)</span>
                  <span>20 (Comprehensive)</span>
                </div>
              </div>

              {/* Visibility */}
              <div className="bg-dark-200/50 rounded-2xl p-6 border border-light-600/20">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label block text-lg font-semibold mb-2">
                      Interview Visibility
                    </label>
                    <p className="text-light-400 text-sm">
                      {form.watch("isPublic") 
                        ? "This interview will be visible to other users for practice"
                        : "This interview will be private (only visible to you)"
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => form.setValue("isPublic", !form.watch("isPublic"))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-success-100 focus:ring-offset-2 ${
                      form.watch("isPublic") ? 'bg-success-100' : 'bg-dark-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        form.watch("isPublic") ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="button"
                  variant="secondary"
                  className="btn-secondary flex-1 order-2 sm:order-1"
                  onClick={() => router.push("/")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-primary flex-1 order-1 sm:order-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Interview...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Create Interview & Generate Questions
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center mt-8 px-2">
        <p className="text-light-400 text-sm">
          💡 <strong>Pro Tip:</strong> Copy and paste the entire job description for the most accurate question generation.
        </p>
      </div>
    </div>
  </div>
);
};

export default CreateInterviewForm;