import type { Metadata } from "next";
import { CheckClient } from "./CheckClient";

export const metadata: Metadata = {
  title: "Review an Offer — OfferCheck",
  description:
    "Paste internship or job offer text to analyze potential concerns, check missing details, and prepare verification questions.",
};

export default function CheckPage() {
  return <CheckClient />;
}
