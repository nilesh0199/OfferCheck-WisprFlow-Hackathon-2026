import { describe, it, expect } from "vitest";
import { selectResources } from "@/lib/analysis/resources";

describe("selectResources", () => {
  it("always includes cybercrime and mca for empty text and empty categories with no matchedTerm", () => {
    const selected = selectResources([], "");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
    expect(selected[0].expanded).toBe(false);
    expect(selected[0].matchedTerm).toBeUndefined();
    expect(selected[1].matchedTerm).toBeUndefined();
  });

  it("flags cybercrime as expanded when upfront_payment category is present", () => {
    const selected = selectResources(["upfront_payment"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when refundable_deposit category is present", () => {
    const selected = selectResources(["refundable_deposit"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when payment_urgency category is present", () => {
    const selected = selectResources(["payment_urgency"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("flags cybercrime as expanded when sensitive_information_request is present", () => {
    const selected = selectResources(["sensitive_information_request"], "");
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(true);
  });

  it("leaves cybercrime non-expanded for other or off_platform_communication categories", () => {
    const selected = selectResources(
      ["off_platform_communication", "other"],
      "Standard offer text."
    );
    const cyber = selected.find((s) => s.resource.id === "cybercrime");
    expect(cyber?.expanded).toBe(false);
  });

  it("includes aicte when text contains word AICTE and populates matchedTerm", () => {
    const selected = selectResources([], "Registered under the AICTE internship scheme.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "aicte", "mca"]);
    const aicte = selected.find((s) => s.resource.id === "aicte");
    expect(aicte?.matchedTerm).toBe("AICTE");
  });

  it("does not include aicte for partial word matches like 'Aicted'", () => {
    const selected = selectResources([], "The student was Aicted by the mentor.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
  });

  it("includes ncs when text contains word NCS or National Career Service and populates matchedTerm", () => {
    const selectedWithNCS = selectResources([], "Found on the NCS portal.");
    expect(selectedWithNCS.map((s) => s.resource.id)).toEqual(["cybercrime", "ncs", "mca"]);
    const ncsItem = selectedWithNCS.find((s) => s.resource.id === "ncs");
    expect(ncsItem?.matchedTerm).toBe("NCS");

    const selectedWithFullName = selectResources(
      [],
      "Post verified via National Career Service database."
    );
    expect(selectedWithFullName.map((s) => s.resource.id)).toEqual([
      "cybercrime",
      "ncs",
      "mca",
    ]);
    const ncsFullNameItem = selectedWithFullName.find((s) => s.resource.id === "ncs");
    expect(ncsFullNameItem?.matchedTerm).toBe("National Career Service");
  });

  it("selects NCS card with matchedTerm 'NCS' when text is 'NCS Group offers a role'", () => {
    const selected = selectResources([], "NCS Group offers a role to the candidate.");
    const ncs = selected.find((s) => s.resource.id === "ncs");
    expect(ncs).toBeDefined();
    expect(ncs?.matchedTerm).toBe("NCS");
  });

  it("does not include ncs for partial word matches like 'NCSU'", () => {
    const selected = selectResources([], "Student studied at NCSU university.");
    expect(selected.map((s) => s.resource.id)).toEqual(["cybercrime", "mca"]);
  });

  it("returns stable order [cybercrime, aicte, ncs, mca] when all are triggered with matchedTerm for conditional cards", () => {
    const text = "AICTE affiliated programme partnered with National Career Service (NCS).";
    const selected = selectResources(["upfront_payment"], text);
    expect(selected.map((s) => s.resource.id)).toEqual([
      "cybercrime",
      "aicte",
      "ncs",
      "mca",
    ]);
    expect(selected[0].expanded).toBe(true);
    expect(selected[0].matchedTerm).toBeUndefined();
    expect(selected[1].matchedTerm).toBe("AICTE");
    expect(selected[2].matchedTerm).toBe("National Career Service");
    expect(selected[3].matchedTerm).toBeUndefined();
  });
});
