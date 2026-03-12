<script setup lang="ts">
import avatar1 from '@images/avatars/profile-men.png'

interface Details {
  Id: string
  UserName: string
  Email: string
  FullName: string
  PhoneNumber: string
  Photo: string
  IdCabang: string
  Group: string
  Active: boolean
}

interface Emit {
  (e: 'submit', value: Details): void
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'reload'): void
}

interface Props {
  cardDetails?: Details
  isDialogVisible: boolean
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    Id: '',
    UserName: '',
    Email: '',
    FullName: '',
    PhoneNumber: '',
    Photo: '',
    IdCabang: '',
    Group: '',
    Active: true,
  }),
  isEditMode: false,
})

const emit = defineEmits<Emit>()

const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success') // default

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))

const status = ref([
  { title: 'Aktif', value: true },
  { title: 'Non Aktif', value: false },
])

watch(
  () => props.cardDetails,
  newVal => {
    cardDetails.value = structuredClone(toRaw(newVal))
  },
  { deep: true, immediate: true },
)

const refInputEl = ref<HTMLElement>()
const isSubmitting = ref(false)

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const submitOrderCencon = async () => {
  try {
    isSubmitting.value = true

    if (cardDetails.value.FullName === null || cardDetails.value.FullName === '') {
      snackbarMessage.value = 'Fullname harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (cardDetails.value.UserName === null || cardDetails.value.UserName === '') {
      snackbarMessage.value = 'Username harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    const payload = {
      Id: cardDetails.value.Id,
      UserName: cardDetails.value.UserName,
      Email: cardDetails.value.Email,
      FullName: cardDetails.value.FullName,
      PhoneNumber: cardDetails.value.PhoneNumber,
      Photo: cardDetails.value.Photo,
      Group: cardDetails.value.Group,
      IdCabang: cardDetails.value.IdCabang,
      Active: cardDetails.value.Active,
    }

    const method = props.isEditMode ? 'PUT' : 'POST'
    const url = props.isEditMode ? `api/Akun/${cardDetails.value.Id}` : 'api/Akun'

    const res = await $api(url, {
      method,
      body: payload,
    })

    if (res?.Metadata?.Code === '200') {
      // sukses
      snackbarMessage.value = res?.Metadata?.Message || 'Terjadi kesalahan!'
      snackbarColor.value = 'success'
      isSnackbarScaleVisible.value = true

      emit('reload')
      emit('submit', cardDetails.value)
      emit('update:isDialogVisible', false) // tutup modal
    }
    else {
      console.log(res?.Metadata?.Message)

      // error → modal tetap buka
      snackbarMessage.value = res?.Metadata?.Message || 'Terjadi kesalahan!'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true
    }
  }
  catch (error) {
    console.error('Gagal submit order:', error)
    snackbarMessage.value = 'Gagal submit order!'
    snackbarColor.value = 'error'
    isSnackbarScaleVisible.value = true

    // modal tetap terbuka
  }
  finally {
    isSubmitting.value = false
  }
}

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
        cardDetails.value.Photo = fileReader.result
    }
  }
}

// Reset Foto
const resetAvatar = () => {
  cardDetails.value.Photo = avatar1
}

const optGroup = ref([])
const optUnit = ref([])

async function fetchGroup() {
  try {
    // const resData = await useApi<any>(createUrl('/api/combo/ComboCabang'))
    const resData = await useApi('/api/combo/ComboGroup')

    if (resData?.data) {
      optGroup.value = resData.data.value
    }
    else {
      optGroup.value = []
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

async function fetchUnit() {
  try {
    // const resData = await useApi<any>(createUrl('/api/combo/ComboCabang'))
    const resData = await useApi('/api/combo/ComboUnit')

    if (resData?.data) {
      optUnit.value = resData.data.value
    }
    else {
      optUnit.value = []
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

await Promise.all([fetchGroup(), fetchUnit()])
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            {{ props.isEditMode ? `EDIT AKUN` : 'ADD AKUN' }}
          </h4>
        </VCardTitle>
      </VCardItem>

      <VCardText class="d-flex">
        <!-- Avatar -->
        <VAvatar
          rounded
          size="100"
          class="me-6"
          :image="cardDetails.Photo || avatar1"
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

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitOrderCencon">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.FullName"
                label="Nama Lengkap"
                placeholder="Superadmin"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.UserName"
                label="UserName"
                placeholder="Superadmin"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Email"
                label="Email"
                placeholder="Superadmin@desa.com"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.PhoneNumber"
                label="Hp"
                placeholder="0812998000001"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="cardDetails.IdCabang"
                label="Unit / Entitas"
                placeholder="Pilih salah satu"
                :items="optUnit"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol
              cols="12"
              sm="12"
            >
              <AppSelect
                v-model="cardDetails.Group"
                label="Group Akses"
                placeholder="Pilih salah satu"
                :items="optGroup"
                multiple
                chips
                persistent-hint
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="cardDetails.Active"
                label="Status"
                placeholder="Status"
                :items="status"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                class="me-4"
                type="submit"
                :loading="isSubmitting"
              >
                Submit
              </VBtn>
              <VBtn
                color="secondary"
                variant="tonal"
                @click="dialogModelValueUpdate(false)"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="isSnackbarScaleVisible"
    transition="scale-transition"
    location="top end"
    variant="flat"
    :color="snackbarColor"
    :timeout="1000"
  >
    {{ snackbarMessage }}
  </VSnackbar>
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
