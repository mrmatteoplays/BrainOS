export async function callClaude(question, existingConcepts, apiKey) {
  const contextStr = existingConcepts.length > 0
    ? `User's existing knowledge: ${existingConcepts.slice(-8).map(n => n.concept).join(', ')}.`
    : 'First question from this user.'

  const prompt = `You are a Second Brain AI. ${contextStr}

Question: "${question}"

Reply with ONLY a raw JSON object. No markdown. No explanation. No text before or after.

{"answer":"2-4 sentence answer here","concept":"core concept 3-6 words","category":"Technology","insight":"one actionable takeaway","connections":["topic1","topic2"],"growth_score":7}

category must be exactly one of: Strategy, Technology, Business, Science, Philosophy, Skills, Other
growth_score is an integer 1-10`

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, apiKey })
  })

  const rawData = await response.json()
  if (!response.ok) throw new Error(`API ${response.status}: ${JSON.stringify(rawData).slice(0, 200)}`)

  const text = (rawData.content || []).map(i => i.text || '').join('').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error(`No JSON in response: ${text.slice(0, 200)}`)
  return JSON.parse(text.slice(start, end + 1))
}
