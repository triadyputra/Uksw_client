// 🗓️ Format untuk kirim ke backend (yyyy-MM-dd)
export function formatDateLocal(date?: Date | null): string | null {
  if (!date)
    return null

  // Jika berupa string dd-MM-yyyy, ubah ke Date object
  if (typeof date === 'string') {
    const [day, month, year] = date.split('-').map(Number)

    // Pastikan hasilnya valid number
    if (!year || !month || !day)
      return null

    date = new Date(year, month - 1, day)
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime()))
    return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 📅 Format untuk tampilan (dd-MM-yyyy)
export function formatTanggal(tgl?: string | null): string {
  if (!tgl)
    return '-'
  const date = new Date(tgl)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

// ⏰ Format jam (HH:mm:ss)
export function formatJam(jam?: string | null): string {
  if (!jam)
    return '-'
  const date = new Date(jam)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

export function parseToIsoDate(dateValue: string | null): string | null {
  if (!dateValue)
    return null

  // kalau format ISO (ada 'T' di dalamnya)
  if (dateValue.includes('T')) {
    const d = new Date(dateValue)

    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }

  // kalau format lokal (DD-MM-YYYY)
  const parts = dateValue.split('-')
  if (parts.length === 3) {
    const [day, month, year] = parts
    const d = new Date(`${year}-${month}-${day}`)

    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }

  return null
}

export function formatNumber(value: number | string) {
  if (value == null || value === '')
    return ''

  return Number(value).toLocaleString('id-ID')
}
