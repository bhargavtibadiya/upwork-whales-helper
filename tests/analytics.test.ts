import { describe, expect, it } from "vitest";
import { sanitizePageview } from "../src/lib/analytics";

describe("analytics privacy", () => {
  it("drops design state and fragments from analytics URLs", () => {
    expect(
      sanitizePageview({
        type: "pageview",
        url: "https://upworkhelper.vercel.app/?p=private-design#portfolio",
      }),
    ).toEqual({ type: "pageview", url: "https://upworkhelper.vercel.app/" });
  });
  it("keeps ordinary page paths", () => {
    expect(
      sanitizePageview({ type: "pageview", url: "https://upworkhelper.vercel.app/" })?.url,
    ).toBe("https://upworkhelper.vercel.app/");
  });
  it("rejects invalid URLs instead of leaking their content", () => {
    expect(sanitizePageview({ type: "pageview", url: "private-design" })).toBeNull();
  });
});
