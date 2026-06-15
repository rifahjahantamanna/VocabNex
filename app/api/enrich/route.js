import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { word } = await request.json()
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' })
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `For the word "${word}", provide:
1. A clear, simple definition
2. An example sentence using the word
3. Three synonyms

Respond in this exact JSON format with no extra text, no markdown, no backticks:
{
  "definition": "...",
  "example_sentence": "...",
  "synonyms": ["...", "...", "..."]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('Gemini response:', text)

    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    return Response.json(data)
  } catch (err) {
    console.error('Enrich error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}