import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { description, size, platform, priorities } = await req.json()
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are a smart home and AI workflow consultant for Ament Home & Tech Services, a premium residential and small-business tech services company in St. Augustine, FL. When given a client's project description and preferences, return a structured project brief with exactly these sections:
**Summary:** 2-3 sentences describing the project.
**Recommended Services:** Bullet list of specific Ament services that apply.
**Estimated Complexity:** One word — Low, Medium, or High — with a one-sentence reason.
**Discovery Call Questions:** 3-5 questions Sarah should ask the client to scope the project accurately.
Keep tone professional but warm. Be specific and actionable.`,
    messages: [{
      role: 'user',
      content: `Client project description: ${description}\nHome/office size: ${size}\nCurrent platform: ${platform}\nTop priorities: ${priorities.join(', ')}`,
    }],
  })
  const brief = (message.content[0] as { type: string; text: string }).text
  return NextResponse.json({ brief })
}
