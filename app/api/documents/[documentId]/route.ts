/**
 * Route proxy API pour récupérer les détails d'un document.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const authHeader = request.headers.get('Authorization') || ''

    const response = await fetch(`${BACKEND_URL}/api/documents/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch document details'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
