import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const OnboardingPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // look up by clerkId, not by internal id.
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { hasCompletedOnboarding: true },
  });

  if (existingUser?.hasCompletedOnboarding) {
    redirect("/api/set-onboarded");
  }

  const userData = {
    id: user.id,
    email: user.emailAddresses[0].emailAddress,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    address: null as string | null,
  };

  return (
    <main className="w-full max-w-[480px] mx-auto">
      <div className="rounded-2xl border-2 border-border bg-background/95 backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(107,70,193,0.25)] p-10 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#574095] via-[#6B46C1] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            A few more details to get you started with ShopSafe
          </p>
        </div>

        <AccountProfile user={userData} btnTitle="Create Account" />

        <p className="text-center text-xs text-muted-foreground pt-2">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors underline-offset-2 hover:underline font-semibold"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors underline-offset-2 hover:underline font-semibold"
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