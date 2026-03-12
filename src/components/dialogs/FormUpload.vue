<script setup lang="ts">
interface Props {
  isDialogVisible: boolean
  title: string
  apiUrl: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:isDialogVisible', 'reload'])

const file = ref<File | null>(null)
const isSubmitting = ref(false)

const dialogUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const snackbar = ref({ show: false, message: '', color: 'success' })

const submitUpload = async () => {
  if (!file.value) {
    snackbar.value = {
      show: true,
      message: 'Harap pilih file!',
      color: 'error',
    }

    return
  }

  const formData = new FormData()

  formData.append('file', file.value)

  try {
    isSubmitting.value = true

    const response = await $api.raw(props.apiUrl, {
      method: 'POST',
      body: formData,
      responseType: 'arrayBuffer', // 🔥 WAJIB
    })

    const contentType = response.headers.get('content-type') || ''

    // ==================================================
    // 🔥 Jika backend return Excel (ErrorImport.xlsx)
    // ==================================================
    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      if (response._data instanceof ArrayBuffer) {
        const blob = new Blob([response._data], {
          type: contentType,
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = 'ErrorImport.xlsx'
        document.body.appendChild(link)
        link.click()
        link.remove()

        window.URL.revokeObjectURL(url)

        snackbar.value = {
          show: true,
          message: 'Import selesai, ada data gagal. File error didownload.',
          color: 'warning',
        }

        return
      }
    }

    // ==================================================
    // 🔥 Jika backend return JSON
    // ==================================================
    let res: any = null

    if (response._data instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(response._data)

      res = JSON.parse(text)
    }

    if (res?.Metadata?.Code === '200') {
      snackbar.value = {
        show: true,
        message: res.Metadata.Message,
        color: 'success',
      }
      emit('reload')
      emit('update:isDialogVisible', false)
    }
    else {
      snackbar.value = {
        show: true,
        message: res?.Metadata?.Message || 'Gagal upload',
        color: 'error',
      }
    }
  }
  catch (err) {
    snackbar.value = {
      show: true,
      message: 'Upload gagal!',
      color: 'error',
    }
  }
  finally {
    isSubmitting.value = false
  }
}

// const submitUpload = async () => {
//   if (!file.value) {
//     snackbar.value = { show: true, message: 'Harap pilih file!', color: 'error' }

//     return
//   }

//   const formData = new FormData()

//   formData.append('file', file.value)

//   try {
//     isSubmitting.value = true

//     const res = await $api(props.apiUrl, {
//       method: 'POST',
//       body: formData,
//     })

//     if (res?.Metadata?.Code === '200') {
//       snackbar.value = { show: true, message: res.Metadata.Message, color: 'success' }
//       emit('reload')
//       emit('update:isDialogVisible', false)
//     }
//     else {
//       snackbar.value = { show: true, message: res.Metadata?.Message || 'Gagal upload', color: 'error' }
//     }
//   }
//   catch (err) {
//     snackbar.value = { show: true, message: 'Upload gagal!', color: 'error' }
//   }
//   finally {
//     isSubmitting.value = false
//   }
// }
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    width="500"
    @update:model-value="dialogUpdate"
  >
    <DialogCloseBtn @click="dialogUpdate(false)" />

    <VCard>
      <VCardTitle class="pa-4 text-center">
        {{ props.title }}
      </VCardTitle>

      <VCardText>
        <VFileInput
          v-model="file"
          label="Pilih file Excel"
          accept=".xlsx,.xls,.csv"
          prepend-icon="tabler-file"
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          @click="dialogUpdate(false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          :loading="isSubmitting"
          @click="submitUpload"
        >
          Upload
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      transition="scale-transition"
      location="top end"
      :timeout="1200"
    >
      {{ snackbar.message }}
    </VSnackbar>
  </VDialog>
</template>

<style lang="scss">
.v-col-xxl,
.v-col-xxl-auto,
.v-col-xxl-12,
.v-col-xxl-11,
.v-col-xxl-10,
.v-col-xxl-9,
.v-col-xxl-8,
.v-col-xxl-7,
.v-col-xxl-6,
.v-col-xxl-5,
.v-col-xxl-4,
.v-col-xxl-3,
.v-col-xxl-2,
.v-col-xxl-1,
.v-col-xl,
.v-col-xl-auto,
.v-col-xl-12,
.v-col-xl-11,
.v-col-xl-10,
.v-col-xl-9,
.v-col-xl-8,
.v-col-xl-7,
.v-col-xl-6,
.v-col-xl-5,
.v-col-xl-4,
.v-col-xl-3,
.v-col-xl-2,
.v-col-xl-1,
.v-col-lg,
.v-col-lg-auto,
.v-col-lg-12,
.v-col-lg-11,
.v-col-lg-10,
.v-col-lg-9,
.v-col-lg-8,
.v-col-lg-7,
.v-col-lg-6,
.v-col-lg-5,
.v-col-lg-4,
.v-col-lg-3,
.v-col-lg-2,
.v-col-lg-1,
.v-col-md,
.v-col-md-auto,
.v-col-md-12,
.v-col-md-11,
.v-col-md-10,
.v-col-md-9,
.v-col-md-8,
.v-col-md-7,
.v-col-md-6,
.v-col-md-5,
.v-col-md-4,
.v-col-md-3,
.v-col-md-2,
.v-col-md-1,
.v-col-sm,
.v-col-sm-auto,
.v-col-sm-12,
.v-col-sm-11,
.v-col-sm-10,
.v-col-sm-9,
.v-col-sm-8,
.v-col-sm-7,
.v-col-sm-6,
.v-col-sm-5,
.v-col-sm-4,
.v-col-sm-3,
.v-col-sm-2,
.v-col-sm-1,
.v-col,
.v-col-auto,
.v-col-12,
.v-col-11,
.v-col-10,
.v-col-9,
.v-col-8,
.v-col-7,
.v-col-6,
.v-col-5,
.v-col-4,
.v-col-3,
.v-col-2,
.v-col-1 {
  inline-size: 100%;
  padding-block: 6px !important;
  padding-inline: 12px !important; /* 6px atas & bawah, 12px kiri & kanan */
}
</style>
