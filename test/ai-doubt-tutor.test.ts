import { describe, expect, it } from "bun:test";
import { solveDoubt } from "../src/ai";

describe("Wallah AI Doubt Tutor", () => {
  it("provides Socratic hint for irrational numbers proof", async () => {
    const res = await solveDoubt({
      question: "How do I prove that √5 is irrational?",
      subject: "maths",
      chapter: "Real Numbers",
      mode: "hint",
    });

    expect(res.mode).toBe("hint");
    expect(res.answer).toContain("Proof by Contradiction");
    expect(res.answer).toContain("co-prime");
    expect(res.engine).toBe("socratic_local");
  });

  it("provides full CBSE step-by-step model answer for Thales theorem", async () => {
    const res = await solveDoubt({
      question: "State and prove Thales theorem",
      subject: "maths",
      chapter: "Triangles",
      mode: "step_by_step",
    });

    expect(res.mode).toBe("step_by_step");
    expect(res.answer).toContain("Basic Proportionality Theorem");
    expect(res.answer).toContain("AD / DB = AE / EC");
  });

  it("guides on quadratic discriminant conditions", async () => {
    const res = await solveDoubt({
      question: "What is discriminant condition for real and equal roots?",
      subject: "maths",
      chapter: "Quadratic Equations",
      mode: "hint",
    });

    expect(res.answer).toContain("D = b² - 4ac");
    expect(res.answer).toContain("D = 0");
  });

  it("explains optics mirror and lens sign conventions", async () => {
    const res = await solveDoubt({
      question: "What are sign conventions for concave mirror and lens?",
      subject: "science",
      chapter: "Light - Reflection & Refraction",
      mode: "hint",
    });

    expect(res.answer).toContain("Cartesian Sign Convention");
    expect(res.answer).toContain("u");
    expect(res.answer).toContain("negative");
  });
});
