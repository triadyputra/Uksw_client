import type { RouteNamedMap, _RouterTyped } from 'unplugin-vue-router'
import { canNavigate } from '@layouts/plugins/casl'

export const setupGuards = (router: _RouterTyped<RouteNamedMap & { [key: string]: any }>) => {
  router.beforeEach(to => {
    // Ambil ulang cookie setiap kali guard dipanggil
    const userDataCookie = useCookie('userData')
    const accessTokenCookie = useCookie('accessToken')

    const userData = userDataCookie.value
    const accessToken = accessTokenCookie.value

    const isLoggedIn = !!(userData && accessToken)

    // 🔹 Route public (bebas diakses)
    if (to.meta.public)
      return

    // 🔹 Jika halaman khusus non-login (login/register)
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'

      return
    }

    // 🔹 Jika user belum login, arahkan ke login
    if (!isLoggedIn) {
      return {
        name: 'login',
        query: {
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      }
    }

    // console.log('Navigating to:', to.name)
    // console.log('Meta:', to.meta)

    // 🔹 Jika login tapi tidak punya izin CASL
    if (!canNavigate(to) && to.matched.length)
      return { name: 'not-authorized' }
  })
}
