import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { word } = await request.json()
    const wordLower = word.toLowerCase().trim()

    const { data: existing } = await supabase
      .from('definitions')
      .select('*')
      .eq('word', wordLower)
      .single()

    if (existing) {
      console.log(`Cache hit for "${wordLower}" — no AI call needed!`)
      return Response.json({
        definition: existing.definition,
        example_sentence: existing.example_sentence,
        synonyms: existing.synonyms
      })
    }

    console.log(`Cache miss for "${wordLower}" — calling Gemini...`)

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `For the word "${wordLower}", provide:
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
    const clean = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(clean)

    await supabase.from('definitions').insert({
      word: wordLower,
      definition: data.definition,
      example_sentence: data.example_sentence,
      synonyms: data.synonyms
    })

    console.log(`Saved "${wordLower}" to definitions cache!`)

    return Response.json(data)
  } catch (err) {
    console.error('Enrich error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}