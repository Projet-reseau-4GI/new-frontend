/**
 * Route proxy API pour l'URL d'authentification Google.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/google/url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get Google auth URL'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
