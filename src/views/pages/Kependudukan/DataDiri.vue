<script setup lang="ts">
import type { DataDiri } from './types'
import avatar1 from '@images/avatars/profile-men.png'

const props = defineProps<{
  formData: DataDiri
}>()

const emit = defineEmits<{
  (e: 'update:formData', value: DataDiri): void
}>()

const formData = ref<DataDiri>(props.formData)

watch(formData, () => {
  emit('update:formData', formData.value)
})

watch(
  () => props.formData,
  newVal => {
    formData.value = newVal
  },
  { deep: true, immediate: true },
)

const optGolDarah = ref([])

async function fetchGolDarah() {
  try {
    const resData = await useApi('/api/combo/ComboGolDarah')

    if (resData?.data) {
      optGolDarah.value = resData.data.value
    }
    else {
      optGolDarah.value = []
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

const refInputEl = ref<HTMLElement>()

// Snackbar
const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// === Fungsi Upload Foto ===
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  if (files && files.length) {
    const fileData = files[0]
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 100 * 1024 // 800 KB

    if (!validTypes.includes(fileData.type)) {
      snackbarMessage.value = 'Format file tidak valid (hanya JPG, PNG, GIF)'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (fileData.size > maxSize) {
      snackbarMessage.value = 'Ukuran file maksimal 100KB'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    fileReader.readAsDataURL(fileData)
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        formData.value.FotoDiriPath = fileReader.result
    }
  }
}

// Reset Foto
const resetAvatar = () => {
  formData.value.FotoDiriPath = avatar1
  console.log(formData)
}

fetchGolDarah()
</script>

<template>
  <VForm>
    <VRow>
      <VCol
        cols="12"
        sm="12"
      >
        <VCardText class="d-flex">
          <!-- Avatar -->
          <VAvatar
            rounded
            size="100"
            class="me-6"
            :image="formData.FotoDiriPath || avatar1"
          />

          <!-- Upload Photo -->
          <form class="d-flex flex-column justify-center gap-4">
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                size="small"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="tabler-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Upload new photo</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,.gif"
                hidden
                @input="changeAvatar"
              >

              <VBtn
                type="reset"
                size="small"
                color="secondary"
                variant="tonal"
                @click="resetAvatar"
              >
                <span class="d-none d-sm-block">Reset</span>
                <VIcon
                  icon="tabler-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">
              Allowed JPG, GIF, or PNG. Max size of 100K
            </p>
          </form>
        </VCardText>
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.NIK"
          label="NIK"
          placeholder="3273045202020002"
        />
      </VCol>

      <VCol
        cols="12"
        sm="12"
      >
        <AppTextField
          v-model="formData.NamaLengkap"
          label="Nama Lengkap"
          placeholder="Muhamad Ahsan Safan"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.TempatLahir"
          label="Tempat Lahir"
          placeholder="Bogor"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppDateTimePicker
          v-model="formData.TanggalLahir"
          label="Tanggal Lahir"
          placeholder="Tanggal Lahir"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.JenisKelamin"
          label="Jenis Kelamin"
          placeholder="Pilih Salah Satu"
          :items="['Laki-laki', 'Perempuan']"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.GolDarah"
          label="Gol Darah"
          placeholder="Pilih Salah Satu"
          :items="optGolDarah"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.Kewarganegaraan"
          label="Kewarganegaraan"
          placeholder="Pilih Salah Satu"
          :items="['WNI', 'WNA']"
        />
      </vcol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppTextField
          v-model="formData.NoTelepon"
          label="No Telepon"
          placeholder="08238829299"
        />
      </VCol>

      <VCol
        cols="12"
        sm="6"
      >
        <AppSelect
          v-model="formData.StatusPenduduk"
          label="Status Penduduk"
          placeholder="Pilih Salah Satu"
          :items="['Tetap', 'Sementara']"
        />
      </vcol>
      <!--  -->
      <!--  -->
    </VRow>
  </VForm>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarScaleVisible"
    transition="scale-transition"
    location="top end"
    variant="flat"
    :color="snackbarColor"
    :timeout="2500"
  >
    {{ snackbarMessage }}
  </VSnackbar>
</template>
