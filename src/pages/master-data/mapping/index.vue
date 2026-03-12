<script setup lang="ts">
definePage({
  meta: {
    action: 'GetListMapping',
    subject: 'MappingCoa',
  },
})

interface ViewListData {
  Id: string
  CoaUnit: string
  Nama: string
  CoaYayasan: string
  UnitId: string
}

const headers = [
  { title: 'Unit / Entitas', key: 'Unit', sortable: false },
  { title: 'Kode COA', key: 'CoaUnit', sortable: false },
  { title: 'Nama COA', key: 'Nama', sortable: false },
  { title: 'Kode COA Yayasan', key: 'CoaYayasan', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '5%' },
]

const userData = useCookie<any>('userData')
const unitId = userData.value?.unit

const optUnit = ref<any[]>([])
const selectedUnit = ref(null)

const isUploadUnitDialog = ref(false)
const isNewCardDialogVisible = ref(false)
const dialogEditMode = ref(false)
const searchQuery = ref('')
const selectedRows = ref([])

const isConfirmDialogVisible = ref(false)
const selectedData = ref<ViewListData | null>(null)

const currentDetail = ref<ViewListData>({
  Id: '',
  CoaUnit: '',
  Nama: '',
  CoaYayasan: '',
  UnitId: '',
})

// pagination & filter
const itemsPerPage = ref(10)
const page = ref(1)

async function fetchCabang() {
  try {
    // const resData = await useApi<any>(createUrl('/api/combo/ComboCabang'))
    const resData = await useApi('/api/combo/ComboUnit')

    if (resData?.data) {
      optUnit.value = resData.data.value ?? []
    }
    else {
      optUnit.value = []
      console.warn('Data cabang kosong atau tidak valid:', resData)
    }

    console.log('Respon cabang:', resData)
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

const queryParams = reactive({
  filter: searchQuery,
  unit: unitId ?? selectedUnit,
  page,
  pageSize: itemsPerPage,
})

const { data: dataApi, execute: fetchData } = await useApi<any>(
  createUrl('/api/MappingCoa/GetListMapping', { query: queryParams }),
)

const listData = computed((): ViewListData[] => dataApi.value?.Data ?? [])
const totalData = computed(() => dataApi.value?.TotalCount ?? 0)

// === OPEN FORM ===
const openUploadDialog = () => {
  isUploadUnitDialog.value = true
}

const openAddDialog = () => {
  currentDetail.value = { Id: '', CoaUnit: '', Nama: '', CoaYayasan: '', UnitId: '' }
  dialogEditMode.value = false
  isNewCardDialogVisible.value = true
}

const openEditDialog = (row: ViewListData) => {
  currentDetail.value = { ...row }
  dialogEditMode.value = true
  isNewCardDialogVisible.value = true
}

// === KONFIRMASI HAPUS ===
const deleteData = (data: ViewListData) => {
  selectedData.value = data
  isConfirmDialogVisible.value = true
}

// === HANDLER SETELAH KONFIRMASI ===
const handleConfirm = async (isConfirmed: boolean) => {
  if (!isConfirmed || !selectedData.value)
    return

  try {
    const res = await $api(`/api/MappingCoa/${selectedData.value.Id}`, {
      method: 'DELETE',
    })

    if (res?.Metadata?.Code === '200') {
      // sukses hapus data
      await fetchData()
    }
    else {
      console.error('Gagal menghapus data:', res?.Metadata?.Message)
    }
  }
  catch (err) {
    console.error('Terjadi kesalahan koneksi ke server:', err)
  }
  finally {
    selectedData.value = null
  }
}

fetchCabang()
</script>

<template>
  <div>
    <!-- Filter -->
    <VCard
      title="Mapping COA"
      class="mb-6"
    >
      <div class="d-flex flex-wrap gap-4 ma-6">
        <div class="d-flex align-center">
          <AppTextField
            v-model="searchQuery"
            placeholder="Cari Data"
            style="inline-size: 200px;"
            class="me-3"
          />
        </div>

        <AppSelect
          v-if="!unitId"
          v-model="selectedUnit"
          placeholder="Pilih Unit / Entitas"
          :items="optUnit"
        />

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
          <VBtn
            v-if="unitId"
            color="primary"
            prepend-icon="tabler-file-upload"
            @click="() => openUploadDialog()"
          >
            Upload
          </VBtn>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="() => openAddDialog()"
          >
            Tambah
          </VBtn>
        </div>
      </div>

      <VDivider class="mt-4" />

      <!-- DataTable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :headers="headers"
        :items="listData"
        :items-length="totalData"
        class="text-no-wrap"
      >
        <!-- Actions -->
        <template #item.Unit="{ item }">
          {{ item.MasterUnit?.Nama }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn>
            <VIcon
              icon="tabler-edit"
              @click="openEditDialog(item)"
            />
          </IconBtn>
          <IconBtn>
            <VIcon
              icon="tabler-trash"
              color="error"
              @click="deleteData(item)"
            />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalData"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </div>

  <!-- Form Tambah/Edit -->
  <FormMapping
    :key="currentDetail?.Id ?? 'new'"
    v-model:is-dialog-visible="isNewCardDialogVisible"
    :card-details="currentDetail"
    :is-edit-mode="dialogEditMode"
    :opt-unit="optUnit"
    :unit="unitId"
    @reload="fetchData"
  />

  <!-- Form Upload -->
  <FormUpload
    v-model:is-dialog-visible="isUploadUnitDialog"
    title="Upload Excel Unit"
    api-url="/api/MappingCoa/ImportExcel"
    @reload="fetchData"
  />

  <!-- Confirm Dialog -->
  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDialogVisible"
    confirmation-question="Apakah Anda yakin ingin menghapus data ini?"
    confirm-title="Data Terhapus!"
    confirm-msg="Data telah berhasil dihapus."
    cancel-title="Dibatalkan"
    cancel-msg="Penghapusan dibatalkan."
    confirm-text="Ya, Hapus"
    cancel-text="Batal"
    confirm-color="error"
    @confirm="handleConfirm"
  />
</template>
