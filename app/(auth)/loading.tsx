import { Sparkles, Shield, Lock } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px] relative">
      {/* Main Loading Animation */}
      <div className="relative">
        {/* Outer rotating ring with gradient */}
        <div
          className="absolute inset-0 w-24 h-24 rounded-full animate-spin"
          style={{
            background:
              "linear-gradient(135deg, #574095 0%, #6B46C1 50%, #8B5CF6 100%)",
            animationDuration: "2s",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px))",
          }}
        />

        {/* Middle pulsing circle */}
        <div
          className="absolute inset-2 w-20 h-20 rounded-full opacity-30 animate-ping"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
            animationDuration: "2s",
          }}
        />

        {/* Inner solid circle with icon */}
        <div
          className="absolute inset-4 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
          }}
        >
          <Shield className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-32 text-center space-y-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 bg-clip-text text-transparent animate-pulse">
          Securing Your Session
        </h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span className="font-semibold">End-to-end encrypted</span>
        </div>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              background: "linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>

      {/* Background glow effect */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div
          className="w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
            animationDuration: "3s",
          }}
        />
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-purple-400 animate-pulse"
            size={16}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: "2s",
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
