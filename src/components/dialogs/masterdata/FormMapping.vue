<script setup lang="ts">
interface Details {
  Id: string
  CoaUnit: string
  Nama: string
  CoaYayasan: string
  UnitId: string
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
  optUnit?: any[] // tambahkan props baru
  unit?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    Id: '',
    CoaUnit: '',
    Nama: '',
    CoaYayasan: '',
    UnitId: '',
  }),
  isEditMode: false,
  optUnit: () => [], // default array kosong
  unit: null,
})

const emit = defineEmits<Emit>()

const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success') // default

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))

const unitId = ref(props.unit ?? null)
const optUnit = ref<any[]>(props.optUnit ?? [])
const optCoa = ref([])

watch(
  () => props.cardDetails,
  newVal => {
    cardDetails.value = structuredClone(toRaw(newVal))
  },
  { deep: true, immediate: true },
)

watch(
  () => props.optUnit,
  val => {
    optUnit.value = val ?? []
  },
  { immediate: true },
)

const isSubmitting = ref(false)

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const submitOrderCencon = async () => {
  try {
    isSubmitting.value = true

    if (cardDetails.value.CoaUnit === null || cardDetails.value.CoaUnit === '') {
      snackbarMessage.value = 'Kode COA harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (cardDetails.value.Nama === null || cardDetails.value.Nama === '') {
      snackbarMessage.value = 'Nama COA harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (cardDetails.value.CoaYayasan === null || cardDetails.value.CoaYayasan === '') {
      snackbarMessage.value = 'Kode Coa Yayasan harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    const payload: any = {
      Id: cardDetails.value.Id,
      CoaUnit: cardDetails.value.CoaUnit,
      Nama: cardDetails.value.Nama,
      CoaYayasan: cardDetails.value.CoaYayasan,
      UnitId: unitId.value ?? cardDetails.value.UnitId,
    }

    // if (props.isEditMode)
    //   payload.Id = cardDetails.value.Id

    const method = props.isEditMode ? 'PUT' : 'POST'
    const url = props.isEditMode ? `api/MappingCoa/${cardDetails.value.Id}` : 'api/MappingCoa'

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

async function fetchCoa() {
  try {
    // const resData = await useApi<any>(createUrl('/api/combo/ComboCabang'))
    const resData = await useApi('/api/combo/ComboCoaYayasan')

    if (resData?.data) {
      optCoa.value = resData.data.value
    }
    else {
      optCoa.value = []
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

fetchCoa()
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
            {{ props.isEditMode ? `EDIT MAPPING COA` : 'ADD MAPPING COA' }}
          </h4>
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitOrderCencon">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.CoaUnit"
                label="Kode Coa"
                placeholder="01"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Nama"
                label="Nama"
                placeholder="Asset"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <!--
                <AppSelect
                v-model="cardDetails.CoaYayasan"
                label="Kode Coa Yayasan"
                placeholder="Pilih Unit / Entitas"
                :items="optCoa"
                />
              -->
              <AppAutocomplete
                v-model="cardDetails.CoaYayasan"
                label="Kode Coa Yayasan"
                :items="optCoa"
                item-title="title"
                item-value="value"
                placeholder="Pilih Salah satu"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-if="!unitId"
                v-model="cardDetails.UnitId"
                label="Unit / Entitas"
                placeholder="Pilih Unit / Entitas"
                :items="optUnit"
                autocomplete="off"
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
