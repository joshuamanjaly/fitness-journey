"use client"; // Required to use Clerk hooks for interactive logic

import Link from "next/link";
import { useUser } from "@clerk/nextjs"; // Hook to check user status

export default function Home() {
  // isSignedIn will be true if the user has already logged in
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. The Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 min-w-full min-h-full object-cover"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 2. The Overlay (Crucial for the "Best UI") */}
      <div className="absolute z-10 inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* 3. The Content */}
      <div className="relative z-20 text-center px-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">
          FITNESS JOURNEY
        </h1>
        <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Master your body through muscle building, weight loss, and elite calisthenics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* DYNAMIC LINK LOGIC:
              If logged in: Send to /onboarding (where they enter age/weight)
              If not logged in: Send to Clerk's sign-in page
          */}
          <Link href={isSignedIn ? "/onboarding" : "/sign-in"}>
            <button className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase tracking-wider">
              {!isLoaded ? "Loading..." : isSignedIn ? "Go to Dashboard" : "Start Your Journey"}
            </button>
          </Link>
        </div>
      </div>

    </main>
  );
}