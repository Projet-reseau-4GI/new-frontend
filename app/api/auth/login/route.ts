/**
 * Route proxy API pour la connexion.
 * Contourne les restrictions CORS en faisant les appels depuis le serveur.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[v0] Login proxy - Received email:', body.email)

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log('[v0] Login proxy - Backend status:', response.status)
    console.log('[v0] Login proxy - Backend response:', responseText.substring(0, 300))

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: responseText }
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Mot de passe ou adresse mail incorrect"
      console.error('[v0] Login failed:', errorMessage)
      return NextResponse.json(
        { 
          message: errorMessage, 
          code: data.code || 'LOGIN_FAILED' 
        }, 
        { status: response.status }
      )
    }

    console.log('[v0] Login successful')
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    console.error('[v0] Backend error:', message)
    return NextResponse.json(
      { message, code: 'BACKEND_ERROR' },
      { status: 500 }
    )
  }
}
