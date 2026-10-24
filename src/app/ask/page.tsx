import React from "react";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { AskClient } from "./AskClient";

export const metadata: Metadata = {
  title: `Clear doubt with AI — ${APP_NAME}`,
  description:
    "Ask specific questions about internship offers, payment demands, or confusing terms. Get calm, step-by-step guidance based on official advisories.",
};

export default function AskPage() {
  return <AskClient />;
}
