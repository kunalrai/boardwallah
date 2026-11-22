export interface DoubtTutorRequest {
  question: string;
  subject?: "maths" | "science" | "social_science" | "english" | "hindi";
  chapter?: string;
  mode?: "hint" | "step_by_step" | "find_mistake";
}

export interface DoubtTutorResponse {
  answer: string;
  mode: "hint" | "step_by_step" | "find_mistake";
  keyTerms: string[];
  suggestedFollowups: string[];
  engine: "gemini" | "socratic_local";
}

const SYSTEM_PROMPT = `You are "Wallah AI Doubt Tutor", an expert Socratic tutor for CBSE Class 10 board examinations.
Your goal is to guide students to complete conceptual mastery and full marks in CBSE board exams.

Pedagogical Rules:
1. Mode Handling:
   - "hint" mode: Do NOT reveal the full calculation or final answer right away. Offer a strategic conceptual hint, identify the governing formula/theorem, and ask a guiding question to prompt the student's next step.
   - "step_by_step" mode: Present the complete model answer following the official CBSE marking scheme format:
     • Given / Known Values
     • Formula / Theorem Statement
     • Step-by-Step Substitution
     • Final Answer (with proper SI units in a box)
   - "find_mistake" mode: Analyze the student's attempted steps, identify the exact line where the error occurred, explain the misconception, and show how to fix it.
2. Typography & Formatting:
   - Use clean, standard Unicode symbols (α, β, √, θ, ², ³, ±, →, Δ, π, ·). Never output unescaped raw LaTeX backslashes that could break JSON parsing.
   - Highlight essential CBSE marking scheme keywords in **bold**.
3. Strict Compliance:
   - Strictly NEVER mention any third-party educators, YouTube channels, or competitor platforms (no "PW", "Physics Wallah", "Prashant", "Kirad", "ExpHub", "Dear Sir").
   - Strictly NO video or external links.`;

export async function solveDoubt(
  req: DoubtTutorRequest,
  geminiApiKey?: string
): Promise<DoubtTutorResponse> {
  const mode = req.mode || "hint";

  if (geminiApiKey) {
    try {
      const prompt = `Student Question: ${req.question}
Subject: ${req.subject || "General Class 10"}
Chapter Context: ${req.chapter || "Class 10 CBSE"}
Requested Mode: ${mode}

Please respond adhering strictly to your Socratic CBSE Mentor instructions.`;

      const modelName = "gemini-2.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            answer: text,
            mode,
            keyTerms: extractKeyTerms(text),
            suggestedFollowups: generateFollowups(req),
            engine: "gemini",
          };
        }
      }
    } catch (e) {
      console.error("Gemini API call error, falling back to Socratic engine:", e);
    }
  }

  // Local Socratic engine fallback
  return runLocalSocraticEngine(req);
}

function extractKeyTerms(text: string): string[] {
  const boldMatches = text.match(/\*\*([^*]+)\*\*/g) || [];
  return boldMatches
    .map((m) => m.replace(/\*\*/g, "").trim())
    .filter((w) => w.length > 2 && w.length < 35)
    .slice(0, 4);
}

function generateFollowups(req: DoubtTutorRequest): string[] {
  const q = req.question.toLowerCase();
  if (q.includes("triangle") || q.includes("thales")) {
    return [
      "Show me how to use Thales theorem in a trapezium",
      "What is the converse of Basic Proportionality Theorem?",
    ];
  }
  if (q.includes("quadratic") || q.includes("root") || q.includes("discriminant")) {
    return [
      "How do I prove roots are real and equal when D = 0?",
      "Solve a word problem on train speed using quadratic equation",
    ];
  }
  if (q.includes("lens") || q.includes("mirror") || q.includes("light")) {
    return [
      "What are the sign conventions for convex vs concave lens?",
      "State Snell's law of refraction with formula",
    ];
  }
  if (q.includes("reaction") || q.includes("acid") || q.includes("salt")) {
    return [
      "What are the colour changes in heating ferrous sulphate?",
      "Why is Plaster of Paris stored in moisture-proof containers?",
    ];
  }
  return [
    "Explain this step with an example",
    "Show me the full 5-mark board answer format",
  ];
}

function runLocalSocraticEngine(req: DoubtTutorRequest): DoubtTutorResponse {
  const q = req.question.toLowerCase();
  const mode = req.mode || "hint";

  // 1. Irrational numbers proof
  if (q.includes("irrational") || q.includes("√2") || q.includes("√3") || q.includes("√5")) {
    if (mode === "hint") {
      return {
        answer: `💡 **Socratic Hint**:
In CBSE Class 10, proofs of irrationality (like √5 or √2) are always solved using **Proof by Contradiction**.

1. **First Step to think about**: What happens if you assume √5 IS rational? You can write it as **a/b**, where a and b are **co-prime integers** (having no common factor other than 1, with b ≠ 0).
2. **Next algebra step**: Square both sides. You get 5 = a²/b² ⇒ a² = 5b².
3. **Guiding Question**: If 5 divides a², what does the Fundamental Theorem of Arithmetic tell you about 5 dividing 'a'? What substitution should you make next for 'a'?`,
        mode,
        keyTerms: ["Proof by Contradiction", "Co-prime integers", "Fundamental Theorem of Arithmetic"],
        suggestedFollowups: ["Show the full 3-mark proof for √5", "What does co-prime mean?"],
        engine: "socratic_local",
      };
    } else {
      return {
        answer: `📝 **Model CBSE Board Answer (3 Marks)**:

**To Prove**: √5 is an irrational number.

**Proof**:
1. Let us assume, to the contrary, that √5 is rational.
2. Therefore, we can find co-prime integers a and b (b ≠ 0) such that:
   √5 = a / b
3. Squaring both sides:
   5 = a² / b²  ⇒  **a² = 5b²**  ...(Equation 1)
4. Since 5 divides 5b², 5 divides a².
   By theorem, if a prime p divides a², then p divides a.
   Therefore, **5 divides a**.
5. Let a = 5c for some integer c.
   Substituting a = 5c in Equation 1:
   (5c)² = 5b²  ⇒  25c² = 5b²  ⇒  **b² = 5c²**
6. This means 5 divides b², so **5 divides b**.
7. From (4) and (6), 5 is a common factor of both a and b.
   This **contradicts** the fact that a and b are co-prime.
8. This contradiction arose because of our incorrect assumption.
   **Hence, √5 is irrational.** [Hence Proved]`,
        mode,
        keyTerms: ["Proof by Contradiction", "Co-prime", "Hence Proved"],
        suggestedFollowups: ["How to prove 3 + 2√5 is irrational?", "Why does p divide a² imply p divides a?"],
        engine: "socratic_local",
      };
    }
  }

  // 2. Thales Theorem / Triangles
  if (q.includes("thales") || q.includes("bpt") || (q.includes("triangle") && q.includes("ratio"))) {
    if (mode === "hint") {
      return {
        answer: `💡 **Socratic Hint for Basic Proportionality Theorem (BPT)**:
Think about areas of triangles sharing the same vertex and altitude!

1. When DE ∥ BC in ΔABC, draw perpendiculars from E to AB (say EN ⊥ AB) and from D to AC (say DM ⊥ AC), and join BE and CD.
2. **Key Ratio to recall**:
   Area(ΔADE) / Area(ΔBDE) = (½ × AD × EN) / (½ × DB × EN) = **AD / DB**.
3. **Guiding Question**: What property relates ΔBDE and ΔCDE? (Hint: They share the same base DE and lie between the same parallel lines DE and BC!)`,
        mode,
        keyTerms: ["Basic Proportionality Theorem", "Same base between parallels", "AD / DB = AE / EC"],
        suggestedFollowups: ["State the converse of BPT", "Show me the full 5-mark proof of Thales theorem"],
        engine: "socratic_local",
      };
    } else {
      return {
        answer: `📝 **Model CBSE Board Answer: Thales' Theorem (Basic Proportionality Theorem, 5 Marks)**:

**Statement**: If a line is drawn parallel to one side of a triangle to intersect the other two sides in distinct points, then the other two sides are divided in the same ratio.

**Given**: A triangle ABC in which line DE ∥ BC intersects AB at D and AC at E.
**To Prove**: AD / DB = AE / EC.
**Construction**: Join BE and CD. Draw DM ⊥ AC and EN ⊥ AB.

**Proof**:
1. Area(ΔADE) = ½ × base × altitude = ½ × AD × EN
2. Area(ΔBDE) = ½ × DB × EN
   Dividing: **Area(ΔADE) / Area(ΔBDE) = AD / DB**  ...(1)
3. Similarly:
   Area(ΔADE) = ½ × AE × DM
   Area(ΔCDE) = ½ × EC × DM
   Dividing: **Area(ΔADE) / Area(ΔCDE) = AE / EC**  ...(2)
4. Note that ΔBDE and ΔCDE are on the **same base DE and between the same parallels DE and BC**:
   Therefore, **Area(ΔBDE) = Area(ΔCDE)**  ...(3)
5. From (1), (2), and (3):
   **AD / DB = AE / EC**
   [Hence Proved]`,
        mode,
        keyTerms: ["Area of triangle", "Same base between parallels", "AD / DB = AE / EC"],
        suggestedFollowups: ["Practice a numerical question on BPT", "Show converse of Thales theorem"],
        engine: "socratic_local",
      };
    }
  }

  // 3. Quadratic Equations & Discriminant
  if (q.includes("quadratic") || q.includes("discriminant") || q.includes("nature of root")) {
    return {
      answer: `💡 **Socratic Guidance on Quadratic Equations**:
For any quadratic equation in standard form **ax² + bx + c = 0 (a ≠ 0)**:

The nature of roots is governed strictly by the **Discriminant (D = b² - 4ac)**:
1. **D > 0**: Two distinct real roots: x = (-b ± √D) / (2a).
2. **D = 0**: Two equal real roots: x = -b / (2a). (Frequent CBSE question: "Find k if equation has equal roots" → Set b² - 4ac = 0!).
3. **D < 0**: No real roots.

**Tip for Board Exams**:
Always check if 'a' contains the unknown 'k'. For example, in (k-1)x² + 2(k-1)x + 1 = 0, remember the condition that a ≠ 0, meaning k ≠ 1!`,
      mode,
      keyTerms: ["Discriminant D = b² - 4ac", "Equal real roots D = 0", "Quadratic formula"],
      suggestedFollowups: ["How to find k for equal roots?", "Explain completing the square method"],
      engine: "socratic_local",
    };
  }

  // 4. Optics: Lens & Mirror Formulas
  if (q.includes("lens") || q.includes("mirror") || q.includes("focal") || q.includes("magnification")) {
    return {
      answer: `💡 **Socratic Guidance: Cartesian Sign Conventions in Optics**:
Students frequently lose marks in signs (+/-). Here is the foolproof CBSE rule:

• **Object Distance (u)**: ALWAYS **negative** for both mirrors and lenses.
• **Focal Length (f)**:
  - Convex mirror & Convex lens: **Positive (+)**
  - Concave mirror & Concave lens: **Negative (-)**
• **Formulas**:
  - Mirror: **1/f = 1/v + 1/u**, Magnification **m = -v/u**
  - Lens: **1/f = 1/v - 1/u**, Magnification **m = +v/u**
• **Interpretation of Magnification (m)**:
  - Negative sign (-) means image is **Real & Inverted**.
  - Positive sign (+) means image is **Virtual & Erect**.
  - |m| > 1 means magnified; |m| < 1 means diminished.`,
      mode,
      keyTerms: ["Cartesian Sign Convention", "Mirror: 1/f = 1/v + 1/u", "Lens: 1/f = 1/v - 1/u"],
      suggestedFollowups: ["Numerical on concave mirror with u = -20 cm", "Power of a lens P = 1/f formula"],
      engine: "socratic_local",
    };
  }

  // 5. Electricity: Ohm's Law and Resistors
  if (q.includes("ohm") || q.includes("resistance") || q.includes("resistor") || q.includes("series") || q.includes("parallel")) {
    return {
      answer: `💡 **Socratic Guidance on Electricity & Circuit Numericals**:
1. **Ohm's Law**: V = I × R (at constant temperature).
2. **Resistance dependence**: **R = ρ(l / A)**, where ρ is resistivity (unit: Ω·m).
   - If a wire is stretched to double its length (l' = 2l), its volume remains constant, so area halves (A' = A/2). New resistance becomes **4 times**!
3. **Series vs Parallel**:
   - In Series: Current (I) remains constant; R_eq = R₁ + R₂ + R₃.
   - In Parallel: Potential difference (V) remains constant; 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃.
4. **Joule's Heating**: H = I²Rt. Power: P = VI = I²R = V²/R.`,
      mode,
      keyTerms: ["Ohm's Law V = IR", "R = ρ(l/A)", "Series vs Parallel", "Joule's Law H = I²Rt"],
      suggestedFollowups: ["Solve stretching wire numerical", "Calculate power consumed in parallel circuits"],
      engine: "socratic_local",
    };
  }

  // Default fallback response
  return {
    answer: `💡 **Socratic Mentor Guidance for CBSE Class 10**:
You asked: "${req.question}"

To approach this question methodically for the CBSE board examinations:
1. **Identify the Given Data & Applicable Principle**: Write down what is given in the problem statement and the core NCERT theorem or definition governing it.
2. **Standard Formula & Units**: Check if all quantities are converted to standard SI units (e.g., cm to m, minutes to seconds).
3. **Step-by-Step Layout**: In subjective 3-mark and 5-mark board questions, marks are awarded for each intermediate step. Always conclude with a boxed final answer with correct units.

*Ask a specific question (e.g., "Give me a hint for proving √5 is irrational", "How to use lens formula?", "Explain reflex arc sequence") to see a focused walkthrough!*`,
    mode,
    keyTerms: ["CBSE Marking Rubric", "SI Units", "Step-by-Step Proof"],
    suggestedFollowups: [
      "Prove √5 is irrational",
      "Explain Thales Theorem with proof",
      "Explain Fleming's Left-Hand Rule",
      "What are the colour changes in heating FeSO4?",
    ],
    engine: "socratic_local",
  };
}
