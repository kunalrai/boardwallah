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

function extractKeyTerms(text) {
  const boldMatches = text.match(/\*\*([^*]+)\*\*/g) || [];
  return boldMatches
    .map((m) => m.replace(/\*\*/g, "").trim())
    .filter((w) => w.length > 2 && w.length < 35)
    .slice(0, 4);
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    } else if (!body || typeof body !== "object") {
      body = {};
    }
    const { question, subject, chapter, mode = "hint" } = body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const prompt = `Student Question: ${question}
Subject: ${subject || "General Class 10"}
Chapter Context: ${chapter || "Class 10 CBSE"}
Requested Mode: ${mode}

Please respond adhering strictly to your Socratic CBSE Mentor instructions.`;

        const modelName = "gemini-2.5-flash";
        const response = await fetch(
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

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.status(200).json({
              answer: text,
              mode,
              keyTerms: extractKeyTerms(text),
              engine: "gemini",
            });
          }
        }
      } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
      }
    }

    // Graceful fallback if no API key or upstream error
    return res.status(200).json({
      answer: `💡 **Socratic Guidance**: You asked: "${question}". Remember to state given quantities with standard SI units, quote the governing theorem/formula, and show all intermediate steps to secure full step marks!`,
      mode,
      keyTerms: ["CBSE Marking Scheme", "Step Marking", "SI Units"],
      engine: "socratic_fallback",
    });
  } catch (err) {
    console.error("Serverless function error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
