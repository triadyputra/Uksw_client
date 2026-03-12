<script setup lang="ts">
import pages401 from '@images/pages/401.png'
import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'

import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'

definePage({
  alias: '/pages/misc/not-authorized',
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

const router = useRouter()
const ability = useAbility()

// TODO: Get type from backend
const userData = useCookie<any>('userData')

const logout = async () => {
  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userData" from cookie
  userData.value = null

  // Redirect to login page
  await router.push('/login')

  // ℹ️ We had to remove abilities in then block because if we don't nav menu items mutation is visible while redirecting user to login page
  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null
  localStorage.removeItem('userAbilityRules')

  // Reset ability to initial ability
  ability.update([])
}
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="401"
      title="You are not authorized! 🔐"
      description="You don’t have permission to access this page. Go Home!."
    />

    <!--
      <VBtn
      class="mb-11"
      to="/"
      >
      Back To Home
      </VBtn>
    -->
    <!-- 👉 Tombol bersebelahan -->
    <div class="d-flex justify-center gap-4 mb-11">
      <VBtn
        to="/"
        color="primary"
      >
        Back To Home
      </VBtn>

      <VBtn
        color="secondary"
        @click="logout"
      >
        Login
      </VBtn>
    </div>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pages401"
        alt="not autorized"
        :max-height="$vuetify.display.smAndDown ? 350 : 500"
        class="mx-auto"
      />
    </div>

    <img
      class="misc-footer-img d-none d-md-block"
      :src="authThemeMask"
      alt="misc-footer-img"
      height="320"
    >
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc";
</style>
