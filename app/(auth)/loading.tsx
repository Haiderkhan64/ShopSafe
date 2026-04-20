import { Shield, Lock } from "lucide-react";


export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px]">
      {/* Spinner */}
      <div
        className="relative w-24 h-24"
        role="status"
        aria-label="Loading, securing your session"
      >
        {/* Rotating gradient ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background:
              "conic-gradient(from 0deg, #574095 0%, #8B5CF6 65%, transparent 100%)",
            animationDuration: "1.4s",
            animationTimingFunction: "linear",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px))",
          }}
        />

        {/* Inner icon circle */}
        <div
          className="absolute inset-[6px] rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
          }}
        >
          <Shield className="w-7 h-7 text-white animate-pulse" style={{ animationDuration: "2s" }} />
        </div>
      </div>

      {/* Text — mt-10 (was mt-32, a bug: spinner is 96px tall, not 300px) */}
      <div className="mt-10 text-center space-y-1.5">
        <p className="text-base font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 bg-clip-text text-transparent">
          Securing Your Session
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Lock className="w-3 h-3" />
          <span className="font-semibold">End-to-end encrypted</span>
        </div>
      </div>

      {/* Bounce dots */}
      <div className="flex gap-2 mt-5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              background: "linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.9s",
            }}
          />
        ))}
      </div>
    </div>
  );
}