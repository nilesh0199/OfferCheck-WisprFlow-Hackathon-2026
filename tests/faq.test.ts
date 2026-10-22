import { describe, it, expect } from "vitest";
import { splitIntoColumns } from "@/lib/faq";

describe("splitIntoColumns", () => {
  it("handles an empty array", () => {
    const [left, right] = splitIntoColumns([]);
    expect(left).toEqual([]);
    expect(right).toEqual([]);
  });

  it("handles a single item array by placing it in the left column", () => {
    const [left, right] = splitIntoColumns(["item-1"]);
    expect(left).toEqual(["item-1"]);
    expect(right).toEqual([]);
  });

  it("splits an even number of items equally (e.g. 6 items -> 3 and 3)", () => {
    const items = ["q1", "q2", "q3", "q4", "q5", "q6"];
    const [left, right] = splitIntoColumns(items);
    expect(left).toEqual(["q1", "q2", "q3"]);
    expect(right).toEqual(["q4", "q5", "q6"]);
  });

  it("splits an odd number of items with ceil(n/2) on the left (e.g. 5 items -> 3 and 2)", () => {
    const items = ["q1", "q2", "q3", "q4", "q5"];
    const [left, right] = splitIntoColumns(items);
    expect(left).toEqual(["q1", "q2", "q3"]);
    expect(right).toEqual(["q4", "q5"]);
  });

  it("preserves item order such that left followed by right reconstructs original array", () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const [left, right] = splitIntoColumns(items);
    expect([...left, ...right]).toEqual(items);
  });
});
