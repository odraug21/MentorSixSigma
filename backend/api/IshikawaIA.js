import express from "express";
import OpenAI from "openai";
import fs from "fs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Prompt recibido:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Falta el campo prompt" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ No se encontró la API key");
      return res.status(500).json({ error: "Falta la API key" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("🚀 Enviando solicitud a OpenAI...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres experto en análisis Ishikawa (6M)." },
        { role: "user", content: prompt },
      ],
    });

    const texto = completion.choices?.[0]?.message?.content || "Sin contenido.";
    console.log("✅ Sugerencia generada:", texto);
    return res.json({ sugerencia: texto });

  } catch (error) {
    const errorInfo = `
❌ ERROR DETECTADO (${new Date().toLocaleString()}):
Nombre: ${error.name}
Mensaje: ${error.message}
Stack: ${error.stack}
Respuesta: ${JSON.stringify(error.response?.data || {}, null, 2)}
------------------------
`;

    // 📄 Guardamos el error en un archivo dentro del backend
    fs.appendFileSync("./error.log", errorInfo);

    console.error("⚠️ Se guardó el error en backend/error.log");
    res.status(500).json({ error: "Error al generar sugerencia IA" });
  }
});

export default router;




