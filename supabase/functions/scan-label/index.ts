// Leest een foto van een voedingswaardentabel uit met Claude.
// Secrets: ANTHROPIC_API_KEY, APP_TOKEN
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-app-token",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

const PROMPT = `Dit is een foto van een voedingswaardentabel op een verpakking.
Geef UITSLUITEND een JSON-object terug, zonder uitleg of markdown:
{"name": "productnaam indien zichtbaar, anders lege string",
 "basis": "g" of "ml" (waarop de kolom 'per 100' is gebaseerd),
 "portion": getal in g of ml van één portie als dat op het etiket staat, anders 0,
 "per100": {"kcal":0,"fat":0,"sat":0,"carbs":0,"sugar":0,"fiber":0,"protein":0,"salt":0}}
Regels: gebruik de kolom 'per 100 g' of 'per 100 ml'. Energie in kcal (niet kJ). Alle waarden in gram, behalve kcal.
Staat er alleen natrium, reken dan om naar zout (natrium × 2,5). Ontbreekt een waarde, gebruik 0.
Gebruik punten als decimaalteken. Geen eenheden in de waarden.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.headers.get("x-app-token") !== Deno.env.get("APP_TOKEN")) return json({ error: "Niet toegestaan" }, 401);
  try {
    const { image, media_type } = await req.json();
    if (!image) return json({ error: "Geen foto ontvangen" }, 400);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 600,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media_type || "image/jpeg", data: image } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });
    const out = await r.json();
    if (!r.ok) return json({ error: out?.error?.message || "Claude-fout" }, 502);
    const text = out.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: "Kon het etiket niet lezen, probeer een scherpere foto" }, 422);
    return json(JSON.parse(m[0]));
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
