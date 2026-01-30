/**
 * Route proxy API pour le callback Google.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google callback failed'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
