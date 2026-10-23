"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  PaymentAskedStatus,
  PaymentPurpose,
  DocumentType,
  ASKED_LABELS,
  PURPOSE_LABELS,
  DOCUMENT_LABELS,
} from "@/lib/combined-text";
import {
  detectSensitiveIdentifiers,
  SENSITIVE_IDENTIFIER_WARNING,
} from "@/lib/sensitive-identifiers";
import { useOfferSession } from "../SessionProvider";

const ASKED_OPTIONS: NonNullable<PaymentAskedStatus>[] = [
  "no",
  "yes_unpaid",
  "yes_paid",
];

const PURPOSES: PaymentPurpose[] = [
  "registration",
  "training",
  "equipment",
  "deposit",
  "verification",
  "other",
];

const DOC_OPTIONS: DocumentType[] = [
  "identity",
  "bank",
  "photo",
  "certificates",
  "other",
  "none",
];

export function Step4Payment() {
  const {
    payment,
    setPaymentAsked,
    togglePaymentPurpose,
    setPaymentAmount,
    setPaymentDeadline,
    toggleDocsAsked,
    toggleDocsShared,
    setPaymentNote,
  } = useOfferSession();

  const isAskedPayment = payment.asked === "yes_unpaid" || payment.asked === "yes_paid";

  const hasSharedSensitive =
    payment.asked === "yes_paid" ||
    payment.docsShared.some((d) => d !== "none");

  const sensitiveKinds = useMemo(() => {
    const combined = `${payment.amount} ${payment.deadline} ${payment.note}`;
    return detectSensitiveIdentifiers(combined);
  }, [payment.amount, payment.deadline, payment.note]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Form Card (8/12 on desktop) */}
      <div className="lg:col-span-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            Money and documents (optional)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Identify upfront financial requests and sensitive identity documents.
          </p>
        </div>

        {/* Calm callout if paid or shared */}
        {hasSharedSensitive && (
          <div
            role="note"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs space-y-1.5"
          >
            <div className="font-semibold text-[var(--text)]">
              Next steps if already paid or shared
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              If you have already paid or shared documents, see what to do now for verified bank and
              national reporting contacts.
            </p>
            <Link
              href="/resources"
              className="inline-block text-[var(--color-primary)] font-medium hover:underline pt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
            >
              See verified reporting steps on /resources
            </Link>
          </div>
        )}

        {/* 1. Were you asked to pay? */}
        <fieldset className="space-y-2.5">
          <legend className="text-xs font-semibold text-[var(--text)]">
            Were you asked to pay anything?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ASKED_OPTIONS.map((opt) => {
              const isSelected = payment.asked === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-asked"
                    value={opt}
                    checked={isSelected}
                    onChange={() => setPaymentAsked(opt)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--border-strong)] bg-[var(--surface)]"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-contrast)]" />
                    )}
                  </span>
                  <span>{ASKED_LABELS[opt]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 2. Conditional Payment Details (if asked) */}
        {isAskedPayment && (
          <div className="space-y-4 pt-3 border-t border-[var(--border)]">
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-[var(--text)]">
                What reason was given for the payment?
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PURPOSES.map((purpose) => {
                  const isChecked = payment.purposes.includes(purpose);
                  return (
                    <label
                      key={purpose}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                        isChecked
                          ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePaymentPurpose(purpose)}
                        className="rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--focus-ring)] w-4 h-4"
                      />
                      <span>{PURPOSE_LABELS[purpose]}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="payment-amount"
                  className="text-xs font-semibold text-[var(--text)]"
                >
                  Amount requested (max 40 chars)
                </label>
                <input
                  id="payment-amount"
                  type="text"
                  maxLength={40}
                  value={payment.amount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. Rs 2,000 or ₹3,499"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="payment-deadline"
                  className="text-xs font-semibold text-[var(--text)]"
                >
                  Deadline given (max 100 chars)
                </label>
                <input
                  id="payment-deadline"
                  type="text"
                  maxLength={100}
                  value={payment.deadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
                  placeholder="e.g. Today by 6 pm, within 24 hours"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Documents Asked For */}
        <fieldset className="space-y-2 pt-3 border-t border-[var(--border)]">
          <legend className="text-xs font-semibold text-[var(--text)]">
            Documents they asked for
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOC_OPTIONS.map((doc) => {
              const isChecked = payment.docsAsked.includes(doc);
              return (
                <label
                  key={doc}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                    isChecked
                      ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDocsAsked(doc)}
                    className="rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--focus-ring)] w-4 h-4"
                  />
                  <span>{DOCUMENT_LABELS[doc]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 4. Documents You Already Shared */}
        <fieldset className="space-y-2 pt-3 border-t border-[var(--border)]">
          <legend className="text-xs font-semibold text-[var(--text)]">
            Documents you have already shared
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DOC_OPTIONS.map((doc) => {
              const isChecked = payment.docsShared.includes(doc);
              return (
                <label
                  key={doc}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                    isChecked
                      ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDocsShared(doc)}
                    className="rounded border-[var(--border-strong)] text-[var(--color-primary)] focus:ring-[var(--focus-ring)] w-4 h-4"
                  />
                  <span>{DOCUMENT_LABELS[doc]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 5. Payment Note */}
        <div className="space-y-1.5 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="payment-note-input"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Payment or document details (optional)
            </label>
            <span className="text-[0.875rem] font-mono text-[var(--text-muted)]">
              {payment.note.length} / 200
            </span>
          </div>
          <input
            id="payment-note-input"
            type="text"
            maxLength={200}
            value={payment.note}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Do not enter account numbers, UPI IDs or ID numbers."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          />
        </div>

        {/* Sensitive Identifier Warning */}
        {sensitiveKinds.length > 0 && (
          <p
            role="alert"
            className="text-xs text-[var(--color-tint-obs-text)] bg-[var(--color-tint-obs-bg)] p-2.5 rounded-lg border border-[var(--color-tint-obs-border)]"
          >
            {SENSITIVE_IDENTIFIER_WARNING}
          </p>
        )}
      </div>

      {/* Right Aside (4/12 on desktop) */}
      <aside className="lg:col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
          Standard practice
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Official advisories from AICTE and the National Career Service (NCS) emphasize that legitimate
          internship and job recruitment services in India do not charge applicants fees.
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Requests for identity cards or bank details before a formal contract or interview are also
          worth verifying independently with the named employer.
        </p>
      </aside>
    </div>
  );
}
