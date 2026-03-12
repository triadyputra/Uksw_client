<script setup lang="ts">
import type { StatusSosial } from './types'

const props = defineProps<{
  formData: StatusSosial
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: StatusSosial): void
}>()

const formData = ref<StatusSosial>(props.formData)

watch(formData, () => {
  emit('update:formData', formData.value)
})

interface OptionResponse {
  optAgama: any[]
  optStatusKeluarga: any[]
  optPendidikan: any[]
  optPekerjaan: any[]
}

interface ApiResponse {
  data: {
    value: OptionResponse
  }
}

interface OptionItem {
  value: string
  title: string
}

const optStatusPerkawinan = ref(['Kawin', 'Belum Kawin', 'Pernah Kawin', 'Cerai Hidup', 'Cerai Mati'])
const optAgama = ref<OptionItem[]>([])
const optStatusKeluarga = ref<OptionItem[]>([])
const optPendidikan = ref<OptionItem[]>([])
const optPekerjaan = ref<OptionItem[]>([])

async function fetchStatus() {
  try {
    const resData = await useApi<ApiResponse>('/api/combo/ComboStatusSosial')

    if (resData?.data) {
      const dataValue = resData.data.value as unknown as OptionResponse

      optAgama.value = dataValue.optAgama ?? []
      optStatusKeluarga.value = dataValue.optStatusKeluarga ?? []
      optPendidikan.value = dataValue.optPendidikan ?? []
      optPekerjaan.value = dataValue.optPekerjaan ?? []

      optAgama.value = dataValue.optAgama
      optStatusKeluarga.value = dataValue.optStatusKeluarga
      optPendidikan.value = dataValue.optPendidikan
      optPekerjaan.value = dataValue.optPekerjaan
    }
    else {
      optAgama.value = []
      optStatusKeluarga.value = []
      optPendidikan.value = []
      optPekerjaan.value = []
      console.warn('Data cabang kosong atau tidak valid:', resData)
    }

    console.log('Respon Data:', resData)
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message)

      if (error.message.includes('Failed to fetch'))
        console.error('Server tidak dapat dijangkau. Periksa koneksi backend atau CORS.')
    }
    else {
      console.error('Error tak terduga:', error)
    }
  }
  finally {
    console.log('Fetch cabang selesai.')
  }
}

fetchStatus()
</script>

<template>
  <VForm>
    <VRow>
      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Agama"
          label="Agama"
          placeholder="Pilih Salah Satu"
          :items="optAgama"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.StatusPerkawinan"
          label="Status Perkawinan"
          placeholder="Pilih Salah Satu"
          :items="optStatusPerkawinan"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.StatusKeluarga"
          label="Status Keluarga"
          placeholder="Pilih Salah Satu"
          :items="optStatusKeluarga"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Pendidikan"
          label="Pendidikan"
          placeholder="Pilih Salah Satu"
          :items="optPendidikan"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Pekerjaan"
          label="Pekerjaan"
          placeholder="Pilih Salah Satu"
          :items="optPekerjaan"
        />
      </VCol>
      <!--  -->
      <!--  -->
    </VRow>
  </VForm>
</template>
