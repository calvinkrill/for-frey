import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Comfort API endpoints

// generate an empathetic, soothing message for Frey based on what she is feeling right now
app.post("/api/comfort-response", async (req, res) => {
  const { mood, userThought } = req.body;
  const targetMood = mood || "broken";
  const thoughtsContext = userThought ? `Frey shared this thought: "${userThought}"` : "Frey clicked to seek general warmth.";

  try {
    const aiClient = getGeminiClient();
    
    const prompt = `You are a deeply compassionate, gentle, and loving presence writing to "Frey". 
Frey is currently feeling ${targetMood} and broken. Your sole goal is to comfort her, validate her feelings, make her feel deeply safe and cherished, and remind her that she does not have to be strong or perfect.
Context/Thoughts: ${thoughtsContext}

Write a short, highly comforting, organic paragraph (3-4 sentences max). 
Guidelines:
1. Address her as "Frey" with immense tenderness.
2. Be incredibly soft, gentle, and warm. Avoid generic clinical advice, toxic positivity, or listicles.
3. Validate her exhaustion and pain. Let her know it's okay to sit in the dark and feel exactly how she feels.
4. Keep the tone intimate, soothing, and beautifully empathetic.
5. Use plain text (no markdown formatting, bolding, or lists).
6. CRITICAL: Use only very basic, simple, clear, and direct English. Avoid any difficult, heavy, complex, or highly literary words. It must be very easy to read and understand.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    // If key is missing or another error occurs, return friendly message so the client falls back eleganty
    res.json({
      success: false,
      error: error.message,
      text: null
    });
  }
});

// write a heartwarming, customized comforting letter of devotion and care to Frey
app.post("/api/write-letter", async (req, res) => {
  const { letterType } = req.body; // e.g., "gentle-reminder", "warm-embrace", "midnight-whisper"
  
  try {
    const aiClient = getGeminiClient();
    
    const prompts: Record<string, string> = {
      "gentle-reminder": "Write a soft, comforting reminder letter to Frey. Tell her how worthy she is, how her soft heart is a masterpiece, and how she is allowed to have bad days. Address her as 'Frey' and end it with a warm sign-off (e.g., 'With endless warmth' or 'Holding you in quiet light').",
      "warm-embrace": "Write a comforting, warm embrace letter to Frey. Wrap her in words of safety, reassurance, and calmness. Reassure her that she is safe now, that the storm will pass, and until then, she can rest completely. Address her as 'Frey'.",
      "midnight-whisper": "Write a quiet, soft midnight-whisper style letter to Frey. For those sleepless or heavy nights when she feels alone and broken. Deliver gentle words of peace, soft wind, and starry starlight. Address her as 'Frey'."
    };

    const selectedPrompt = prompts[letterType] || prompts["gentle-reminder"];

    const prompt = `You are a tender companion of infinite kindness writing a direct letter to "Frey" to soothe her aching soul. 
${selectedPrompt}
Keep the letter to around 120-150 words. Do not use complex formatting. Do not use generic or corny phrases. Use very simple, clean, and basic English language that feels deeply real, validating, and calming. Avoid any difficult or complex words. She must be able to read and understand it very easily. Keep it in plain paragraphs with line Breaks. No markdown asterisks (**).`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
      }
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in letter generation:", error);
    res.json({
      success: false,
      error: error.message,
      text: null
    });
  }
});

// create a soft, custom comforting poem for Frey
app.post("/api/generate-poem", async (req, res) => {
  try {
    const aiClient = getGeminiClient();
    const prompt = `Write a beautiful, comforting 3-stanza poem dedicated specifically to "Frey". 
The poem should be soft, serene, filled with pink/dark-night imagery (stars, gentle rain, blossoms, softness, quiet light).
It should comfort her broken heart, reminding her of her gentle strength and the beauty of resting.
Use her name "Frey" once or twice in the poem. 
Do not use markdown formatting. Use simple line breaks.
CRITICAL: The poem must use incredibly basic, simple, clear, and easy English vocabulary. Do not use complex, heavy, hard, or obscure literary words. Anyone reading should understand every single word immediately and feel soothed.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
      }
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in poem generation:", error);
    res.json({
      success: false,
      error: error.message,
      text: null
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Comfort Space Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
