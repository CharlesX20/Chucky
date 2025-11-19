"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

// Form validation schema
const interviewFormSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  description: z.string().min(10, "Please provide a detailed job description"),
  level: z.enum(["entry", "junior", "mid", "senior", "executive"]),
  type: z.enum(["Behavioral", "Technical", "Mixed", "General"]),
  amount: z.number().min(3).max(20),
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
        // userid will be handled in the API route via auth
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Interview created successfully!");
        // Reset form
        form.reset();
        // Refresh the page to show new interview in the list
        router.refresh();
      } else {
        toast.error("Failed to create interview. Please try again.");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create New Interview
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              label="Job Title"
              placeholder="e.g., Marketing Manager, Software Engineer, Sales Representative"
              type="text"
            />

            <div>
              <FormField
                control={form.control}
                name="description"
                label="Job Description"
                placeholder="Paste the job posting or describe the role, responsibilities, and required skills..."
                type="text"
              />
              <p className="text-sm text-light-400 mt-1">
                Provide detailed information for better question generation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">Experience Level</label>
                <select
                  {...form.register("level")}
                  className="input w-full"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="label block mb-2">Interview Type</label>
                <select
                  {...form.register("type")}
                  className="input w-full"
                >
                  <option value="Behavioral">Behavioral</option>
                  <option value="Technical">Technical</option>
                  <option value="Mixed">Mixed</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label block mb-2">
                Number of Questions: {form.watch("amount")}
              </label>
              <input
                type="range"
                min="3"
                max="20"
                {...form.register("amount", { valueAsNumber: true })}
                className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-light-100 mt-1">
                <span>3 (Quick)</span>
                <span>20 (Comprehensive)</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Interview..." : "Create Interview & Generate Questions"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateInterviewForm;