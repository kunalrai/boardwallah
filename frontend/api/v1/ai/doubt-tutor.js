export const config = {
  maxDuration: 60,
};

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
3. Mathematical Drawings & Scientific Diagrams:
   - When the student asks to "draw", "plot", "sketch", "show diagram", "diagram", or when solving a geometric problem (triangles, circles & tangents, heights & distances / angle of elevation & depression, coordinate geometry graphs, ray diagrams, prism, electrical circuits):
   - You MUST generate a clean, self-contained, responsive SVG drawing enclosed within a single \`\`\`svg ... \`\`\` code block.
   - Always tag the code fence as \`\`\`svg (never \`\`\`xml or empty).
    - SVG Specifications:
     • Keep the SVG concise and focused (under 25 vector elements) so it completes swiftly and cleanly.
     • Always use viewBox="0 0 420 250" and style="width:100%; max-width:440px; height:auto; display:block; margin:auto;"
     • Include a subtle rounded card background: <rect width="100%" height="100%" fill="#ffffff" rx="10" stroke="#e2e8f0" stroke-width="1.5"/>
     • Use crisp CBSE pedagogical colors:
       - Primary geometric lines: stroke="#2563eb", stroke-width="2.5"
       - Altitude / height / normal / dashed lines: stroke="#64748b", stroke-dasharray="4,4", stroke-width="2"
       - Tangents / rays / highlights: stroke="#dc2626" or stroke="#ea580c", stroke-width="2.2"
       - Angles / shaded sectors: fill="#dbeafe", stroke="#3b82f6"
     • Label all points, vertices (A, B, C, P), angles (e.g. 30°, 60°, 90°), side lengths (h, r, d), and axes with crisp <text font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a"> labels.
     • Ensure all text, paths, lines, and circles have explicit stroke/fill colors so they are immediately visible.
     • Always fully close the SVG with </svg> and close the code fence with \`\`\`. Never truncate the SVG code block.
4. Strict Compliance:
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
    let body = {};
    try {
      body = req.body || {};
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
    } catch (bodyErr) {
      body = {};
    }
    if (!body || typeof body !== "object") {
      body = {};
    }
    let { question, subject, chapter, mode = "hint", image, imageMime, history = [] } = body;

    if (!question && image) {
      question = "Please inspect the problem in the attached image and provide the official CBSE Class 10 step-by-step solution, formula derivation, and final boxed answer with units.";
    }

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question or doubt image is required" });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const contents = [];

        // 1. Sliding Window Multi-Turn History (Session Memory)
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history) {
            if (!item || !item.content) continue;
            const role = (item.role === 'model' || item.role === 'assistant') ? 'model' : 'user';
            contents.push({
              role: role,
              parts: [{ text: String(item.content) }]
            });
          }
        }

        // 2. Current Turn
        const prompt = `Student Question / Doubt: ${question}
Subject: ${subject || "General Class 10 CBSE"}
Chapter Context: ${chapter || "Class 10 CBSE Board Exam"}
Requested Mode: ${mode}

Please inspect any attached image, prior conversation context, or text, and respond adhering strictly to your Socratic CBSE Mentor instructions. If an image of a problem, diagram, or formula is provided, transcribe the problem accurately, state the given values, governing formulas, and show complete CBSE step-marking substitution.`;

        const currentParts = [];
        if (image && typeof image === "string") {
          const cleanBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;
          const mimeType = imageMime || (image.startsWith("data:image/png") ? "image/png" : "image/jpeg");
          currentParts.push({
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          });
        }
        currentParts.push({ text: prompt });

        contents.push({
          role: "user",
          parts: currentParts
        });

        const candidateModels = [
          "gemini-3.5-flash-lite",
          "gemini-flash-lite-latest",
          "gemini-3.5-flash",
          "gemini-3.8-flash"
        ];
        let text = null;

        for (const modelName of candidateModels) {
          try {
            const modelAbortCtrl = new AbortController();
            const modelTimeout = setTimeout(() => modelAbortCtrl.abort(), 25000);
            let response;
            try {
              response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  signal: modelAbortCtrl.signal,
                  body: JSON.stringify({
                    systemInstruction: {
                      parts: [{ text: SYSTEM_PROMPT }]
                    },
                    contents: contents,
                    generationConfig: {
                      temperature: 0.3,
                      maxOutputTokens: 8192,
                    },
                  }),
                }
              );
            } finally {
              clearTimeout(modelTimeout);
            }

            if (response.ok) {
              const data = await response.json();
              const parts = data?.candidates?.[0]?.content?.parts || [];
              text = parts.map((p) => p.text || "").filter(Boolean).join("");
              if (text) break;
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.warn(`Gemini API non-200 for ${modelName}:`, response.status, errorData?.error?.message || errorData);
            }
          } catch (modelErr) {
            console.warn(`Attempt with ${modelName} failed:`, modelErr);
          }
        }

        if (text) {
          return res.status(200).json({
            answer: text,
            mode,
            keyTerms: extractKeyTerms(text),
            engine: "gemini",
          });
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
