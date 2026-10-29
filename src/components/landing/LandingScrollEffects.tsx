"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function LandingScrollEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Accessibility: skip if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    // 2. Mobile / Touch check: skip Lenis momentum on touch screens to preserve native scrolling
    const isTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    // 3. Print media check
    const isPrint = window.matchMedia("print").matches;

    // Register ScrollTrigger plugin with GSAP
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let updateTicker: ((time: number) => void) | null = null;
    let styleObserver: MutationObserver | null = null;

    if (!isTouch && !isPrint) {
      try {
        lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
          touchMultiplier: 1,
          prevent: (node) => {
            return (
              node.hasAttribute("data-lenis-prevent") ||
              Boolean(node.closest && node.closest("[data-lenis-prevent]")) ||
              Boolean(node.closest && node.closest("#app-sidebar")) ||
              Boolean(document.getElementById("app-sidebar")?.hasAttribute("open")) ||
              document.body.style.overflow === "hidden" ||
              document.documentElement.style.overflow === "hidden"
            );
          },
        });

        // Store reference globally for direct control by modals / sidebar
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

        if (typeof lenis.on === "function") {
          lenis.on("scroll", ScrollTrigger.update);
        }

        updateTicker = (time: number) => {
          lenis?.raf(time * 1000);
        };

        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);
      } catch {
        // Fall back gracefully to native scrolling if Lenis fails
      }
    }

    // Stop Lenis when sidebar opens, restart when it closes
    const handleSidebarToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.open === "boolean") {
        if (customEvent.detail.open) {
          lenis?.stop();
        } else {
          lenis?.start();
        }
      }
    };
    window.addEventListener("toggle-sidebar", handleSidebarToggle);

    // Watch for style changes on body/documentElement (e.g. overflow: hidden) to stop Lenis
    try {
      styleObserver = new MutationObserver(() => {
        const isLocked =
          document.body.style.overflow === "hidden" ||
          document.documentElement.style.overflow === "hidden" ||
          Boolean(document.getElementById("app-sidebar")?.hasAttribute("open"));
        if (isLocked) {
          lenis?.stop();
        } else {
          lenis?.start();
        }
      });
      styleObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
      styleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    } catch {
      // Safe fallback
    }

    // Print event listeners to suspend Lenis
    const handleBeforePrint = () => {
      lenis?.stop();
    };
    const handleAfterPrint = () => {
      lenis?.start();
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    // Responsive animations with GSAP matchMedia
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero entrance reveal on page load
      const heroTl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      heroTl
        .from(".hero-title", {
          opacity: 0,
          y: 25,
          duration: 0.85,
          clearProps: "transform,opacity",
        })
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 18,
            duration: 0.75,
            clearProps: "transform,opacity",
          },
          "-=0.55"
        )
        .from(
          ".hero-cta",
          {
            opacity: 0,
            y: 16,
            duration: 0.65,
            clearProps: "transform,opacity",
          },
          "-=0.45"
        )
        .from(
          ".hero-trust",
          {
            opacity: 0,
            y: 12,
            duration: 0.55,
            clearProps: "transform,opacity",
          },
          "-=0.35"
        )
        .from(
          ".hero-card",
          {
            opacity: 0,
            x: 25,
            duration: 0.85,
            clearProps: "transform,opacity",
          },
          "-=0.7"
        );

      // Hero subtle parallax drift on scroll
      gsap.to(".hero-left-content", {
        yPercent: -6,
        opacity: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-left-content",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Wizard 5-step cards staggered reveal
      gsap.from(".wizard-step-card", {
        y: 35,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: "#how-it-works",
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      // Capabilities comparison columns
      gsap.from(".capabilities-col", {
        y: 30,
        opacity: 0,
        duration: 0.65,
        stagger: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: "#what-you-get",
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      // Final CTA scale-in
      gsap.from(".final-cta-card", {
        scale: 0.96,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".final-cta-card",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      window.removeEventListener("toggle-sidebar", handleSidebarToggle);
      styleObserver?.disconnect();
      if ((window as unknown as { __lenis?: Lenis }).__lenis === lenis) {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      if (updateTicker) {
        gsap.ticker.remove(updateTicker);
      }
      if (lenis) {
        lenis.destroy();
      }
      mm.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
