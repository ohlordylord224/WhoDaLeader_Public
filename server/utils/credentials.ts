// The ONLY module that knows where tokens live.
// Cloud edition swaps the implementation (per-tenant DB lookup + OAuth refresh)
// without touching any caller — callers always await credentials.getHubspotToken().
export interface Credentials {
  getHubspotToken(): string | Promise<string>
}

export const credentials: Credentials = {
  getHubspotToken: () => {
    const token = process.env.HUBSPOT_TOKEN
    if (!token) throw new Error('HUBSPOT_TOKEN is not set in environment')
    return token
  },
}
