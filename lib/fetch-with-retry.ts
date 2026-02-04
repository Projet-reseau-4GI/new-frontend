/**
 * Utility to perform fetch with exponential backoff retry logic.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = 3,
    backoff = 1000,
): Promise<Response> => {
    try {
        const response = await fetch(url, options)

        // Retry on 5xx server errors
        if (!response.ok && response.status >= 500) {
            throw new Error(`Server Error: ${response.status}`)
        }

        return response
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying... (${retries} left). Waiting ${backoff}ms`)
            await wait(backoff)
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }
        throw error
    }
}
