export const retryFetch = async (url: string, options: RequestInit | undefined = undefined, n: number = 2): Promise<Response> => {
    try {
        return await fetch(url, options)
    } catch (e) {
        if (n === 1) throw e
        return await retryFetch(url, options, n - 1)
    }
}