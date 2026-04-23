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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const rawText = await response.text()
  if (!response.ok) throw new Error(`API ${response.status}: ${rawText.slice(0, 300)}`)

  const data = JSON.parse(rawText)
  const text = (data.content || []).map(i => i.text || '').join('').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error(`No JSON in response: ${text.slice(0, 200)}`)
  return JSON.parse(text.slice(start, end + 1))
}
