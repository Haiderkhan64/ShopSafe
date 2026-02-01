import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  name: string;
  address: string | null;
  role?: "ADMIN" | "ANALYST" | "CUSTOMER";
}

const OnboardingPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Default user data structure
  const userData: UserData = {
    id: user.id,
    email: user.emailAddresses[0].emailAddress,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    address: null,
    role: "CUSTOMER", // Default role
  };

  return (
    <main className="flex flex-col items-center justify-center w-full max-w-[600px] mx-auto p-6 bg-gradient-to-br from-black to-[#574095] rounded-2xl shadow-2xl">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-gray-100">
            Provide some additional information to get started with ShopSafe
          </p>
        </div>

        <div className="mt-6 w-full p-6 bg-white/10 backdrop-blur-md rounded-lg">
          <AccountProfile
            user={userData}
            btnTitle="Create Account"
            // Apply Tailwind classes to style the form container
          />
        </div>

        <p className="mt-4 text-center text-xs text-gray-100">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
};

export default OnboardingPage;
