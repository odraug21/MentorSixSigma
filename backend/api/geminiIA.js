// backend/api/geminiIA.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Flag para no insistir si la key está mala
let geminiDisponible = true;

export async function generarConGemini(prompt) {
  try {
    if (!geminiDisponible) {
      console.warn("⚠️ Gemini deshabilitado (API key inválida/expirada).");
      return "";
    }

    console.log("📩 Prompt Gemini:", prompt);

    if (!prompt) throw new Error("Falta el prompt para Gemini");
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ No se encontró GEMINI_API_KEY");
      throw new Error("Falta la clave de Gemini");
    }

    console.log("🚀 Enviando solicitud a Gemini 2.5 Flash...");
    const result = await model.generateContent(prompt);
    const texto = result.response.text() || "Sin respuesta generada.";

    console.log("✅ Respuesta Gemini:", texto);
    return texto;
  } catch (error) {
    const msg = `${error.message || error}`;

    // 👇 Aquí detectamos la key mala/expirada y apagamos Gemini
    if (
      msg.includes("API key expired") ||
      msg.includes("API_KEY_INVALID")
    ) {
      geminiDisponible = false;
      console.error("⛔ Gemini deshabilitado: API key expirada o inválida.");
    }

    const errorInfo = `
❌ ERROR GEMINI (${new Date().toLocaleString()}):
Nombre: ${error.name}
Mensaje: ${error.message}
Stack: ${error.stack}
------------------------
`;
    fs.appendFileSync("./error.log", errorInfo);
    console.error("⚠️ Error guardado en backend/error.log");

    // Devolvemos vacío para que el controlador haga fallback
    return "";
  }
}

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el campo 'prompt'." });
    }

    const texto = await generarConGemini(prompt);
    res.json({ sugerencia: texto });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al generar sugerencia con Gemini" });
  }
});

export default router;
