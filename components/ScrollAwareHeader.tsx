"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/shared/Topbar";

export default function ScrollHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      // Hide header when scrolling down past 80px
      else if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Attach scroll listener with passive for better performance
    window.addEventListener("scroll", controlHeader, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 w-full
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <TopBar />
    </header>
  );
}
