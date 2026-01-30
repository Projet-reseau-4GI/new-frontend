"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function ServerWaker() {
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        let showWakeUpToast = false
        const timeoutId = setTimeout(() => {
            showWakeUpToast = true
            toast.loading("Le serveur démarre, cela peut prendre jusqu'à une minute...", {
                id: "server-wakeup",
                duration: Infinity,
            })
        }, 2000)

        fetch("/api/health")
            .then((res) => {
                clearTimeout(timeoutId)
                if (showWakeUpToast) {
                    toast.dismiss("server-wakeup")
                    toast.success("Serveur prêt !", { duration: 3000 })
                }
            })
            .catch((err) => {
                clearTimeout(timeoutId)
                if (showWakeUpToast) {
                    toast.dismiss("server-wakeup")
                    // On ne fait rien en cas d'erreur pour ne pas alarmer l'utilisateur si c'est juste un échec de ping
                    console.error("Health check failed", err)
                }
            })

        return () => clearTimeout(timeoutId)
    }, [])

    return null
}
