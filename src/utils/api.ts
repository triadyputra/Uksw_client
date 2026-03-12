import crypto from 'node:crypto'
import CryptoJS from 'crypto-js'
import { ofetch } from 'ofetch'

// === Fungsi utilitas untuk HMAC ===
export async function generateHMAC(code: string, secret: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: Node.js crypto
    const hmac = crypto.createHmac('sha256', secret)

    hmac.update(code)

    return hmac.digest('hex')
  }
  else {
    // Client-side: crypto-js
    const hmac = CryptoJS.HmacSHA256(code, secret)

    return hmac.toString(CryptoJS.enc.Hex)
  }
}

export async function encryptTimestamp(secret: string) {
  const kode = Math.floor(Date.now() / 1000).toString()
  const signature = await generateHMAC(kode, secret)

  return { kode, signature }
}

// === Helper untuk menambah header HMAC ===
async function attachHmacHeaders(options: any) {
  const secretKey = import.meta.env.VITE_HMAC_SECRET_KEY ?? 'default-secret'
  const { kode, signature } = await encryptTimestamp(secretKey)

  // pastikan headers ada
  if (!options.headers)
    options.headers = new Headers()

  // jika bukan instance Headers, ubah ke Headers agar bisa append
  if (!(options.headers instanceof Headers)) {
    const hdr = new Headers()

    Object.entries(options.headers).forEach(([k, v]) => hdr.append(k, v as string))
    options.headers = hdr
  }

  options.headers.append('X-Kode', kode)
  options.headers.append('X-Signature', signature)
}

// === API untuk Login ===
// export const $apiLogin = ofetch.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL_LOGIN || '/api',

//   async onRequest({ options }) {
//     const accessToken = useCookie('accessToken').value

//     if (accessToken)
//       options.headers.append('Authorization', `Bearer ${accessToken}`)

//     // 🔒 Tambahkan header keamanan
//     await attachHmacHeaders(options)
//   },
// })

// === API utama ===
export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value

    if (accessToken)
      options.headers.append('Authorization', `Bearer ${accessToken}`)

    // 🔒 Tambahkan header keamanan
    await attachHmacHeaders(options)
  },
})
