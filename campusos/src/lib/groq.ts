export async function generateJsonGroq<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: '/no_think\nRespond with valid JSON only. No markdown fences, no explanations, no thinking tags. Output must start with [ or {.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response.');

  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  text = text.trim();

  try {
    return JSON.parse(text) as T;
  } catch {
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]) as T;

    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      const parsed = JSON.parse(objMatch[0]);
      if (Array.isArray(parsed)) return parsed as T;
      return (parsed.insights ?? parsed.data ?? Object.values(parsed)[0]) as T;
    }

    throw new Error('Groq response contained no JSON.');
  }
}
