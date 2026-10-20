"use client";

import React, { useRef, useState, useEffect } from "react";
import { Container } from "@/components/Container";
import { isFeatureEnabled } from "@/lib/features";
import { FileTextIcon, HelpCircleIcon, ShieldCheckIcon } from "@/components/Icons";

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const hasUpload = isFeatureEnabled("documentUpload");
  const hasResearchPrompt = isFeatureEnabled("companyResearchPrompt");

  const steps = [
    {
      num: "01",
      title: "Paste the offer text",
      description: hasUpload
        ? "Paste offer text or upload an offer document to begin analysis."
        : "Copy and paste the email, message, or offer letter into the review tool. No registration, login, or document upload required.",
      icon: <FileTextIcon className="w-5 h-5 text-[var(--accent)]" />,
    },
    {
      num: "02",
      title: "Review observations and missing terms",
      description:
        "Examine terms highlighted directly against exact quotes. Missing details like stipend or salary, working hours, and duration are kept in a separate checklist.",
      icon: <HelpCircleIcon className="w-5 h-5 text-[var(--accent)]" />,
    },
    {
      num: "03",
      title: "Verify with the sender using targeted questions",
      description: hasResearchPrompt
        ? "Clarify terms with drafted verification questions, consult official Indian registries, or copy a structured prompt to research the company with an external assistant."
        : "Use drafted verification questions to request clarification from the recruiter, and cross-reference with official Indian government registries.",
      icon: <ShieldCheckIcon className="w-5 h-5 text-[var(--primary-ledger)]" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-16 sm:py-24 border-t border-[var(--border)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-2xs uppercase tracking-wider text-[var(--primary-ledger)] font-semibold">
            Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text)]">
            How OfferCheck works
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            A three-step checklist to help you evaluate an internship or job offer
            before taking irreversible actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.num}
              style={{
                transitionDelay: `${index * 120}ms`,
              }}
              className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono text-sm font-bold text-[var(--text-muted)]">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text)]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border)] text-2xs font-mono text-[var(--text-muted)]">
                Step {index + 1} of 3
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
