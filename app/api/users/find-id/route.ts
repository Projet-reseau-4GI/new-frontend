/**
 * Route proxy API pour trouver un utilisateur par email.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('Authorization') || ''

    const response = await fetch(
      `${BACKEND_URL}/api/users/find-id?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to find user'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
