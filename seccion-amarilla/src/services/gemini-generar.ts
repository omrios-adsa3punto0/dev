// src/services/gemini-generar.ts
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Tu clave en .env

export async function generateIAResponse(prompt: string): Promise<string> {
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    if (!resp.ok) {
      throw new Error(`Gemini API error: ${resp.status} ${await resp.text()}`);
    }

    const data = await resp.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No se generó respuesta"
    );
  } catch (err) {
    console.error("Error al generar respuesta con Gemini:", err);
    throw err;
  }
}
