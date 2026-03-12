<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { compressToUTF16 } from 'lz-string'
import Swal from 'sweetalert2'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)

const route = useRoute()
const router = useRouter()

const isLoggingIn = ref(false)

const ability = useAbility()

const errors = ref<Record<string, string | undefined>>({
  username: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()

const credentials = ref({
  username: '',
  password: '',
})

// const rememberMe = ref(false)

const login = async () => {
  try {
    isLoggingIn.value = true // mulai loading

    const res = await $api('/api/Auth/login', {
      method: 'POST',
      body: {
        username: credentials.value.username,
        password: credentials.value.password,
        modul: 'cencon',
      },
      onResponseError({ response }) {
        errors.value = response._data.errors
      },
    })

    console.log(res)

    // const { accessToken, userData, userAbilityRules } = res

    // Cek kode response
    if (res?.metadata?.code !== '200') {
      const message = res?.metadata?.message?.toLowerCase() || 'Login gagal'

      console.log(message)
      console.log(message.includes('username'))

      // Reset semua error dulu
      errors.value = { username: undefined, password: undefined }

      // Cek pesan berhubungan dengan username
      if (message.includes('username') || message.includes('user'))
        errors.value.username = res.metadata.message

      // Cek pesan berhubungan dengan password
      else if (message.includes('password') || message.includes('pasword') || message.includes('sandi'))
        errors.value.password = res.metadata.message

      // Pesan umum
      else
        errors.value.username = res.metadata.message || 'Login gagal, periksa kembali data Anda'

      return
    }

    const userAbilityRules = res.response?.acces
    const compressed = compressToUTF16(JSON.stringify(userAbilityRules))

    // console.log(compressed)

    // const rules = JSON.parse(decompressFromUTF16(compressed))

    // console.log(rules)
    localStorage.setItem('userAbilityRules', compressed)
    useCookie('userAbilityRules').value = compressed

    ability.update(userAbilityRules)

    useCookie('userData').value = res.response?.user

    useCookie('accessToken').value = res.response?.token

    // Redirect to `to` query if exist or redirect to index route
    // ❗ nextTick is required to wait for DOM updates and later redirect
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  }
  catch (err) {
    console.error(err)
    isLoggingIn.value = false // selesai loading, tombol aktif lagi
    // ❗ SweetAlert error
    Swal.fire({
      title: 'Error',
      text: err,
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
  finally {
    isLoggingIn.value = false // selesai loading, tombol aktif lagi
  }
}

const onSubmit = () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid)
        login()
    })
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-uppercase"> {{ themeConfig.app.title }} </span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.username"
                  :rules="[requiredValidator]"
                  label="Username"
                  placeholder="username"
                  type="text"
                  autofocus
                  :error-messages="errors.username"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6" />

                <VBtn
                  :loading="isLoggingIn"
                  :disabled="isLoggingIn"
                  block
                  type="submit"
                >
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
