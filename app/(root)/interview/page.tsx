import CreateInterviewForm from "@/components/CreateInterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Custom Interview</h1>
        <p className="text-lg text-light-100">
          Fill in the job details below and we'll generate tailored interview questions for you
        </p>
      </div>
      
      <CreateInterviewForm />
    </div>
  );
};

export default Page;