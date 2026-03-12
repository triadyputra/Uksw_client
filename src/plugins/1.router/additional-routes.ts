import type { RouteRecordRaw } from 'vue-router/auto'

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      const userData = useCookie<Record<string, unknown> | null | undefined>('userData')

      // const userRole = userData.value

      console.log(userData)
      console.log('userData')
      if (userData)
        return { name: 'beranda' }

      return { name: 'login', query: to.query }
    },
  },
]
