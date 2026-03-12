import crypto from 'node:crypto'
import { createFetch } from '@vueuse/core'
import CryptoJS from 'crypto-js'
import { destr } from 'destr'

// === Utility untuk HMAC (server + client) ===
async function generateHMAC(code: string, secret: string): Promise<string> {
  if (typeof window === 'undefined') {
    const hmac = crypto.createHmac('sha256', secret)

    hmac.update(code)

    return hmac.digest('hex')
  }
  else {
    const hmac = CryptoJS.HmacSHA256(code, secret)

    return hmac.toString(CryptoJS.enc.Hex)
  }
}

async function encryptTimestamp(secret: string) {
  const kode = Math.floor(Date.now() / 1000).toString()
  const signature = await generateHMAC(kode, secret)

  return { kode, signature }
}

// === Main API Instance ===
const apiBase = String(import.meta.env.VITE_API_BASE_URL || '/api')
export const useApi = createFetch({
  baseUrl: apiBase,
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,

    // 🟢 Tambahkan Authorization dan HMAC header
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value
      const secretKey = import.meta.env.VITE_HMAC_SECRET_KEY ?? 'default-secret'
      const { kode, signature } = await encryptTimestamp(secretKey)

      // 🧱 Pastikan headers selalu berupa objek
      if (!options.headers)
        options.headers = {}

      // 🧠 Karena TypeScript bisa strict, cast jadi Record<string, string>
      const headers = options.headers as Record<string, string>

      headers['Accept'] = 'application/json'
      headers['X-Kode'] = kode
      headers['X-Signature'] = signature

      if (accessToken)
        headers['Authorization'] = `Bearer ${accessToken}`

      options.headers = headers

      return { options }
    },

    // 🟢 Parsing response JSON secara aman
    afterFetch(ctx) {
      const { data, response } = ctx
      let parsedData: any = null

      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error('❌ JSON parse error:', error)
      }

      return { data: parsedData, response }
    },

    // 🟢 Error handler opsional
    onFetchError(ctx) {
      console.error('❌ Fetch error:', ctx.error)

      return ctx
    },
  },
})

// === Main API Instance ===
export const useApiMe = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL_LOGIN || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,

    // 🟢 Tambahkan Authorization dan HMAC header
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value
      const secretKey = import.meta.env.VITE_HMAC_SECRET_KEY ?? 'default-secret'
      const { kode, signature } = await encryptTimestamp(secretKey)

      // 🧱 Pastikan headers selalu berupa objek
      if (!options.headers)
        options.headers = {}

      // 🧠 Karena TypeScript bisa strict, cast jadi Record<string, string>
      const headers = options.headers as Record<string, string>

      headers['Accept'] = 'application/json'
      headers['X-Kode'] = kode
      headers['X-Signature'] = signature

      if (accessToken)
        headers['Authorization'] = `Bearer ${accessToken}`

      options.headers = headers

      return { options }
    },

    // 🟢 Parsing response JSON secara aman
    afterFetch(ctx) {
      const { data, response } = ctx
      let parsedData: any = null

      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error('❌ JSON parse error:', error)
      }

      return { data: parsedData, response }
    },

    // 🟢 Error handler opsional
    onFetchError(ctx) {
      console.error('❌ Fetch error:', ctx.error)

      return ctx
    },
  },
})
