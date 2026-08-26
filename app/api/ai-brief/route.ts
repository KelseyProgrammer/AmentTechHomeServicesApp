import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  let body: { description?: string; size?: string; platform?: string; priorities?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { description, size, platform, priorities } = body
  if (!description?.trim()) {
    return NextResponse.json({ error: 'Please describe your project first.' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set')
    return NextResponse.json({ error: 'AI scoping is temporarily unavailable.' }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `You are a smart home and AI workflow consultant for Ament Home & Tech Services, a premium residential and small-business tech services company in St. Augustine, FL. When given a client's project description and preferences, return a structured project brief with exactly these sections:
**Summary:** 2-3 sentences describing the project.
**Recommended Services:** Bullet list of specific Ament services that apply.
**Estimated Complexity:** One word — Low, Medium, or High — with a one-sentence reason.
**Discovery Call Questions:** 3-5 questions Sarah should ask the client to scope the project accurately.
Keep tone professional but warm. Be specific and actionable.`,
      messages: [{
        role: 'user',
        content: `Client project description: ${description}\nHome/office size: ${size || 'Not specified'}\nCurrent platform: ${platform || 'Not specified'}\nTop priorities: ${priorities?.length ? priorities.join(', ') : 'Not specified'}`,
      }],
    })

    const block = message.content[0]
    if (block?.type !== 'text') {
      throw new Error('Unexpected response format from model')
    }
    return NextResponse.json({ brief: block.text })
  } catch (err) {
    console.error('AI brief error:', err)
    return NextResponse.json(
      { error: 'Could not generate your brief right now — please try again in a moment.' },
      { status: 502 }
    )
  }
}
