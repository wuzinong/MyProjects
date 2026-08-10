import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Google AI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Endpoint for generating resource image using Google AI
app.post("/api/generate-resource-image", async (req, res) => {
  try {
    const { name, description, category, rarity, element, backgroundStory, customPrompt } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Resource name is required" });
    }

    const ai = getAiClient();
    
    // Prompt for Xianxia fantasy resource art
    const prompt = customPrompt 
      ? `修仙玄幻风格插画，主题：【${name}】。微调要求：${customPrompt}。品质：${rarity || '法宝'}，属性：${element || '无'}，类别：${category || '资源'}。细节描述：${description || ''} ${backgroundStory || ''}。画面要求：精美东方修仙神话国风，高光色彩，唯美玄幻，精致轮廓，无文字。`
      : `修仙玄幻风格插画，主题：【${name}】。品质：${rarity || '法宝'}，属性：${element || '无'}，类别：${category || '资源'}。细节描述：${description || ''} ${backgroundStory || ''}。画面要求：精美东方修仙神话国风，高光色彩，唯美玄幻，精致轮廓，无文字。`;

    // 1. Try Gemini image generation model (gemini-3.1-flash-lite-image)
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || "image/png";
            const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            return res.json({ success: true, imageUrl, method: "imagen" });
          }
        }
      }
    } catch (imgErr: any) {
      console.warn("Gemini image generation model call fallback:", imgErr?.message || imgErr);
    }

    // 2. Fallback: Use Gemini 3.6 Flash text model to generate custom SVG art code
    const textResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `你是一个玄幻修仙游戏图元设计AI。请根据以下修仙资源描述，生成一个可直接嵌入<img> src 的极其精美的矢量SVG图形代码（必须以 <svg 开头，</svg> 结尾，带 viewBox="0 0 200 200"，包含唯美的渐变、暗色古风背景、光芒特效与主体图形，不要包含任何markdown代码块标签外的内容）：
名称：${name}
品质：${rarity}
属性：${element}
描述：${description}`,
    });

    const rawSvg = textResponse.text || "";
    const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      const svgCode = svgMatch[0];
      const base64Svg = Buffer.from(svgCode).toString("base64");
      return res.json({ success: true, imageUrl: `data:image/svg+xml;base64,${base64Svg}`, method: "svg" });
    }

    return res.json({ success: false, error: "Unable to parse generated image" });
  } catch (error: any) {
    console.error("Error in /api/generate-resource-image:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate image" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
