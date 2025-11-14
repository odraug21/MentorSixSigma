import dotenv from "dotenv";
dotenv.config({ path: "C:/1OdraugSmartLogistics/a3mentor/backend/.env" });
import OpenAI from "openai";

console.log("🔍 Iniciando test de conexión con OpenAI...");

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ No se encontró OPENAI_API_KEY en backend/.env");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

try {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Prueba de conexión directa desde Node.js" }],
    max_tokens: 20
  });

  console.log("✅ Conexión correcta. Respuesta:");
  console.log(completion.choices[0].message.content);

} catch (error) {
  console.error("❌ ERROR DIRECTO desde OpenAI:");
  console.error("Nombre:", error.name);
  console.error("Mensaje:", error.message);
  console.error("Detalles:", error.response?.data || error);
}
