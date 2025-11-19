import CreateInterviewForm from "@/components/CreateInterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="max-w-4xl mx-auto">
      <CreateInterviewForm />
    </div>
  );
};

export default Page;