import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* This component is the pre-built Clerk login box */}
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: "#2563eb", // This matches your blue button
          },
          elements: {
            card: "bg-slate-900 border border-slate-800",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
          }
        }}
      />
    </div>
  );
}