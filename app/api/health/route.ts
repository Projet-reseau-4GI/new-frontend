
import { NextResponse } from 'next/server'

const BACKEND_URL = 'https://new-backend-network.onrender.com'

export async function GET() {
    try {
        console.log('[v0] Waking up backend...')

        // On appelle une route publique pour réveiller le serveur
        // Utilisation d'un endpoint générique ou public
        const response = await fetch(`${BACKEND_URL}/api`, {
            method: 'GET',
        })

        console.log('[v0] Backend wake-up status:', response.status)

        if (response.ok) {
            return NextResponse.json({ status: 'ok', message: 'Backend is awake' })
        } else {
            // Même si ça fail (ex: 404), le serveur est réveillé
            return NextResponse.json({ status: 'ok', warning: 'Backend responded with error but is awake' })
        }

    } catch (error) {
        console.error('[v0] Wake-up failed:', error)
        return NextResponse.json(
            { status: 'error', message: 'Failed to reach backend' },
            { status: 500 }
        )
    }
}
