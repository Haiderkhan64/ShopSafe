"use client";

import React, { useState, useEffect } from "react";

const PARTICLE_COUNT = 8;


interface Particle {
  top: string;
  left: string;
  duration: string | null;
  delay: string | null;
  isEven: boolean;
}

function makeDeterministicParticles(): Particle[] {
  return [...Array(PARTICLE_COUNT)].map((_, i) => ({
    top: `${(i * 13.7 + 5) % 100}%`,
    left: `${(i * 17.3 + 10) % 100}%`,
    duration: null,
    delay: null,
    isEven: i % 2 === 0,
  }));
}

function makeRandomParticles(): Particle[] {
  return [...Array(PARTICLE_COUNT)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${3 + Math.random() * 4}s`,
    delay: `${Math.random() * 2}s`,
    isEven: i % 2 === 0,
  }));
}

function Loader() {
  const [particles, setParticles] = useState<Particle[]>(
    makeDeterministicParticles
  );

  useEffect(() => {
    // Only runs on the client — never compared to SSR output.
    setParticles(makeRandomParticles());
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 overflow-hidden transition-colors duration-300">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              p.isEven
                ? "bg-purple-400/20 dark:bg-purple-400/30"
                : "bg-yellow-400/20 dark:bg-yellow-400/30"
            }`}
            style={{
              top: p.top,
              left: p.left,
              // Omit animation styles until after hydration to avoid mismatch.
              animation: p.duration
                ? `float-particle ${p.duration} ease-in-out infinite`
                : undefined,
              animationDelay: p.delay ?? undefined,
            }}
          />
        ))}
      </div>

      <div className="relative">
        {/* Main Glow Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-72 bg-gradient-to-r from-purple-400/20 via-indigo-400/20 to-yellow-400/10 dark:from-purple-400/30 dark:via-indigo-400/30 dark:to-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Main Content Container */}
        <div className="relative flex flex-col items-center gap-8">
          {/* ShopSafe Logo Animation */}
          <div className="relative">
            <div
              className="relative w-44 h-44 flex items-center justify-center"
              style={{ animation: "float-gentle 3s ease-in-out infinite" }}
            >
              {/* Rotating Rings */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#574095]/60 dark:border-t-[#6B46C1]/80 border-r-[#574095]/30 dark:border-r-[#6B46C1]/40"
                style={{ animation: "spin 3s linear infinite" }}
              />
              <div
                className="absolute inset-4 rounded-full border-4 border-transparent border-t-[#6B46C1]/60 dark:border-t-[#8B5CF6]/80 border-l-[#6B46C1]/30 dark:border-l-[#8B5CF6]/40"
                style={{ animation: "spin 4s linear infinite reverse" }}
              />
              <div
                className="absolute inset-8 rounded-full border-3 border-transparent border-b-yellow-500/50 dark:border-b-yellow-400/70 border-r-yellow-400/30 dark:border-r-yellow-400/50"
                style={{ animation: "spin 5s linear infinite" }}
              />

              {/* Center Shield */}
              <div className="relative z-10">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#574095]/30 to-[#6B46C1]/30 dark:from-[#6B46C1]/40 dark:to-[#8B5CF6]/40 blur-2xl rounded-full"
                    style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                  />
                  <div
                    className="relative"
                    style={{ animation: "shield-float 2s ease-in-out infinite" }}
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 35 L20 75 C20 80 25 80 25 80 L75 80 C75 80 80 80 80 75 L80 35"
                        className="stroke-white dark:stroke-gray-100"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M30 35 L30 25 C30 20 35 20 40 20 L60 20 C65 20 70 20 70 25 L70 35"
                        className="stroke-white dark:stroke-gray-100"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M50 30 L30 40 L30 60 C30 70 40 75 50 78 C60 75 70 70 70 60 L70 40 L50 30Z"
                        className="fill-[#6B46C1] dark:fill-[#8B5CF6]"
                      />
                      <path
                        d="M40 55 L47 62 L62 47"
                        className="stroke-[#FFD700] dark:stroke-[#FCD34D]"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        style={{ animation: "draw-check 2s ease-in-out infinite" }}
                      />
                    </svg>

                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 dark:bg-yellow-300 rounded-full shadow-lg"
                      style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
                    >
                      <div className="absolute inset-0 bg-yellow-400 dark:bg-yellow-300 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>

                  {/* Orbiting Dots */}
                  {[
                    { color: "from-[#574095] to-[#6B46C1]", darkColor: "dark:from-[#6B46C1] dark:to-[#8B5CF6]", delay: "0s",   duration: "3s"   },
                    { color: "from-[#6B46C1] to-purple-500",  darkColor: "dark:from-[#8B5CF6] dark:to-purple-400",  delay: "0.3s", duration: "3.5s" },
                    { color: "from-yellow-400 to-yellow-500",  darkColor: "dark:from-yellow-300 dark:to-yellow-400", delay: "0.6s", duration: "4s"   },
                    { color: "from-purple-500 to-indigo-500",  darkColor: "dark:from-purple-400 dark:to-indigo-400", delay: "0.9s", duration: "4.5s" },
                  ].map((dot, i) => (
                    <div
                      key={i}
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{
                        animation: `orbit ${dot.duration} linear infinite`,
                        animationDelay: dot.delay,
                      }}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${dot.color} ${dot.darkColor} shadow-lg`}
                      />
                    </div>
                  ))}
                </div>

                {/* Sparkles */}
                {[
                  { position: "-top-10 left-10",   delay: "0s",   size: "w-2.5 h-2.5" },
                  { position: "top-10 -right-10",   delay: "0.8s", size: "w-3 h-3"     },
                  { position: "-bottom-8 -left-10", delay: "1.6s", size: "w-2 h-2"     },
                  { position: "bottom-10 right-8",  delay: "2.4s", size: "w-2.5 h-2.5" },
                ].map((sparkle, index) => (
                  <div
                    key={`sparkle-${index}`}
                    className={`absolute ${sparkle.position}`}
                    style={{
                      animation: "sparkle-twinkle 3s ease-in-out infinite",
                      animationDelay: sparkle.delay,
                    }}
                  >
                    <div className={`${sparkle.size} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 dark:from-yellow-200 dark:to-yellow-400 rounded-full blur-sm" />
                      <div className="absolute inset-0 bg-yellow-400 dark:bg-yellow-300 rounded-full" />
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-200 dark:via-yellow-100 to-transparent" />
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-200 dark:via-yellow-100 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Text & Loading */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-4xl font-bold text-[#574095] dark:text-purple-300"
                style={{ fontFamily: "Arial, system-ui, sans-serif", letterSpacing: "-0.02em" }}
              >
                ShopSafe
              </span>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === 1
                        ? "bg-[#FFD700] dark:bg-yellow-400"
                        : "bg-[#6B46C1] dark:bg-purple-400"
                    }`}
                    style={{
                      animation: "dot-bounce 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <p
              className="text-sm font-medium text-[#6B46C1] dark:text-purple-300"
              style={{
                fontFamily: "Arial, system-ui, sans-serif",
                animation: "fade-pulse 2s ease-in-out infinite",
              }}
            >
              Loading your secure experience
            </p>

            <div className="w-72 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
                  animation: "progress-slide 2s ease-in-out infinite",
                }}
              />
            </div>

            <div className="flex items-center gap-4 mt-2">
              {[
                { icon: "🔒", label: "Secure",  bg: "from-purple-100 to-purple-50", darkBg: "dark:from-purple-900/50 dark:to-purple-800/30", text: "text-[#574095] dark:text-purple-300", border: "border-white/50 dark:border-purple-500/30" },
                { icon: "⚡", label: "Fast",    bg: "from-yellow-100 to-yellow-50", darkBg: "dark:from-yellow-900/50 dark:to-yellow-800/30", text: "text-[#D97706] dark:text-yellow-300",  border: "border-white/50 dark:border-yellow-500/30" },
                { icon: "✓", label: "Trusted", bg: "from-indigo-100 to-indigo-50", darkBg: "dark:from-indigo-900/50 dark:to-indigo-800/30", text: "text-[#6B46C1] dark:text-indigo-300",  border: "border-white/50 dark:border-indigo-500/30" },
              ].map((badge, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br ${badge.bg} ${badge.darkBg} backdrop-blur-sm rounded-full shadow-sm border ${badge.border} transition-colors duration-300`}
                  style={{
                    animation: "fade-up 0.5s ease-out",
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "backwards",
                  }}
                >
                  <span className="text-xs">{badge.icon}</span>
                  <span className={`text-xs font-bold ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes float-particle { 0%, 100% { transform: translate(0, 0); opacity: 0.2; } 50% { transform: translate(25px, -35px); opacity: 0.5; } }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.3); opacity: 0.6; } }
        @keyframes shield-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes draw-check { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes pulse-dot { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(60px) rotate(0deg); } to { transform: rotate(360deg) translateX(60px) rotate(-360deg); } }
        @keyframes sparkle-twinkle { 0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(180deg); opacity: 1; } }
        @keyframes dot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fade-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes progress-slide { 0% { transform: translateX(-100%); } 50% { transform: translateX(0%); } 100% { transform: translateX(100%); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Loader;