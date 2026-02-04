/**
 * Utility to check if the network connection is stable.
 */
export const checkNetworkStability = (): boolean => {
    if (typeof navigator !== "undefined" && "onLine" in navigator) {
        if (!navigator.onLine) {
            return false
        }
    }

    // Optional: Check connection type if available
    const nav = navigator as any
    if (nav.connection) {
        // Avoid uploading if on 2g or slow-2g
        if (nav.connection.effectiveType === "2g" || nav.connection.effectiveType === "slow-2g") {
            console.warn("Connection too slow for upload")
            // We could block here, but for now we just warn as per the guide
        }
    }

    return true
}
