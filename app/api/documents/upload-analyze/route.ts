/**
 * Route proxy API pour l'upload et l'analyse de documents.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Passer le formData directement au backend
    const response = await fetch(`${BACKEND_URL}/api/documents/upload-analyze`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: formData,
    })

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch {
      // If parsing fails, use the raw text as the message (or a default error)
      console.error('[v0] Failed to parse backend response:', responseText.substring(0, 200))
      data = {
        message: response.ok ? 'Invalid JSON response from backend' : (responseText || response.statusText),
        code: 'INVALID_RESPONSE'
      }
    }

    if (!response.ok) {
      console.error('[v0] Backend error status:', response.status, data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Document upload failed'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
