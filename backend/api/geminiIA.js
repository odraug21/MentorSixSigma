import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Prompt recibido (Gemini):", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Falta el campo 'prompt'." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ No se encontró GEMINI_API_KEY");
      return res.status(500).json({ error: "Falta la clave de Gemini." });
    }

    console.log("🚀 Enviando solicitud a Gemini 2.5 Flash...");
    const result = await model.generateContent(prompt);

    const texto = result.response.text() || "Sin respuesta generada.";

    console.log("✅ Respuesta Gemini:", texto);
    res.json({ sugerencia: texto });
  } catch (error) {
    const errorInfo = `
❌ ERROR GEMINI (${new Date().toLocaleString()}):
Nombre: ${error.name}
Mensaje: ${error.message}
Stack: ${error.stack}
------------------------
`;
    fs.appendFileSync("./error.log", errorInfo);
    console.error("⚠️ Error guardado en backend/error.log");
    res
      .status(500)
      .json({ error: "Error al generar sugerencia con Gemini" });
  }
});

export default router;
