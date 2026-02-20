/**
 * Utility to perform fetch with exponential backoff retry logic.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchWithRetry = async (
    url: string,
    options: RequestInit & { timeout?: number },
    retries = 3,
    backoff = 1000,
): Promise<Response> => {
    const { timeout = 60000, ...fetchOptions } = options // Default 60s timeout

    try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        })

        clearTimeout(id)

        // Retry on 5xx server errors
        if (!response.ok && response.status >= 500) {
            throw new Error(`Server Error: ${response.status}`)
        }

        return response
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Request timed out after ${timeout}ms`)
            throw new Error(`Request timeout: The server took too long to respond (> ${timeout / 1000}s).`)
        }

        if (retries > 0) {
            console.warn(`Retrying... (${retries} left). Waiting ${backoff}ms`)
            await wait(backoff)
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }
        throw error
    }
}
