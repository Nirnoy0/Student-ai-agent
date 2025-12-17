export async function onRequestPost(context) {
  const { request, env } = context;
  const { message } = await request.json();

  // Simple “agent” system prompt (customize for your agency)
  const system = `
You are a helpful tutor for students.
- Explain step-by-step.
- If user asks for assignments, give a rubric + practice tasks.
- If you are unsure, ask a clarifying question.
  `.trim();

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ],
      temperature: 0.4
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return new Response(errText, { status: resp.status });
  }

  const data = await resp.json();
  const reply = data?.choices?.[0]?.message?.content ?? "";

  return Response.json({ reply });
}
