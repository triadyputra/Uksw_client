<script setup lang="ts">
interface Details {
  Id: string
  Periode: string
  Kode: string
  Nama: string
  Jenis: string
  Debet: number
  Kredit: number
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
  optUnit?: any[]
  unit?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    Id: '',
    Periode: '',
    Kode: '',
    Nama: '',
    Jenis: '',
    Debet: 0,
    Kredit: 0,
  }),
  isEditMode: false,
})

const emit = defineEmits<Emit>()

const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))
const optCoa = ref<any>([])
const isSubmitting = ref(false)

const jenis = ref([
  { title: 'Gabungan', value: 'Gabungan' },
  { title: 'Konsolidasi', value: 'Konsolidasi' },
])

watch(
  () => props.cardDetails,
  newVal => {
    cardDetails.value = structuredClone(toRaw(newVal))
  },
  { deep: true, immediate: true },
)

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const submitOrderCencon = async () => {
  try {
    isSubmitting.value = true

    if (!cardDetails.value.Periode) {
      snackbarMessage.value = 'Periode harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (!cardDetails.value.Jenis) {
      snackbarMessage.value = 'Jenis harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    if (!cardDetails.value.Kode) {
      snackbarMessage.value = 'Kode COA harus diisi'
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    const payload = {
      Id: cardDetails.value.Id,
      Periode: cardDetails.value.Periode,
      Kode: cardDetails.value.Kode,
      Jenis: cardDetails.value.Jenis,
      Debet: cardDetails.value.Debet,
      Kredit: cardDetails.value.Kredit,
    }

    const method = props.isEditMode ? 'PUT' : 'POST'
    const url = props.isEditMode ? `api/Eleminasi/${cardDetails.value.Id}` : 'api/Eleminasi'

    const res = await $api(url, { method, body: payload })

    if (res?.Metadata?.Code === '200') {
      snackbarMessage.value = res?.Metadata?.Message || 'Berhasil disimpan!'
      snackbarColor.value = 'success'
      isSnackbarScaleVisible.value = true

      emit('reload')
      emit('submit', cardDetails.value)
      emit('update:isDialogVisible', false)
    }
    else {
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
  }
  finally {
    isSubmitting.value = false
  }
}

// 🔹 Fetch COA berdasarkan Unit
async function fetchCoa() {
  // console.log('Panggil')

  try {
    const url = '/api/combo/ComboCoaYayasan'
    const resData = await useApi(url)

    // 👇 periksa bentuk data dari API
    // console.log('Respon Data COA:', resData)

    optCoa.value = resData.data.value
  }
  catch (error) {
    console.error('❌ Error Fetch COA:', error)
    optCoa.value = []
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
            {{ props.isEditMode ? `EDIT ELEMINASI` : 'ADD ELEMINASI' }}
          </h4>
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitOrderCencon">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Periode"
                label="Periode"
                placeholder="112025"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppAutocomplete
                v-model="cardDetails.Kode"
                label="Kode Coa"
                :items="optCoa"
                item-title="title"
                item-value="value"
                placeholder="Pilih Salah satu"
                clearable
                clear-icon="tabler-x"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="cardDetails.Jenis"
                label="Jenis"
                placeholder="Pilih salah satu"
                :items="jenis"
                clearable
                clear-icon="tabler-x"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Debet"
                label="Debet"
                type="number"
                placeholder="112025"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Kredit"
                label="Kredit"
                type="number"
                placeholder="112025"
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
