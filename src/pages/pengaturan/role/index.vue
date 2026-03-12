<script setup lang="ts">
definePage({
  meta: {
    action: 'GetListAkun',
    subject: 'Akun',
  },
})

interface ViewListData {
  Id: string
  Name: string
  Access: string
  Keterangan: string
  Photo: string
}

const headers = [
  /* { title: 'ID', key: 'Id', sortable: false, width: '15%' }, */
  { title: 'Nama', key: 'Name', sortable: false, width: '25%' },

  /* { title: 'Access', key: 'Access', sortable: false }, */
  { title: 'Keterangan', key: 'Keterangan', sortable: false, width: '70%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '5%' },
]

const isNewCardDialogVisible = ref(false)
const dialogEditMode = ref(false)
const searchQuery = ref('')
const selectedRows = ref([])

const isConfirmDialogVisible = ref(false)
const selectedData = ref<ViewListData | null>(null)

const currentDetail = ref<ViewListData>({
  Id: '',
  Name: '',
  Access: '',
  Keterangan: '',
  Photo: '',
  AccessDefault: null,
})

// pagination & filter
const itemsPerPage = ref(10)
const page = ref(1)

const queryParams = reactive({
  filter: searchQuery,
  page,
  pageSize: itemsPerPage,
})

const { data: dataApi, execute: fetchData } = await useApi<any>(
  createUrl('/api/Role/GetListRole', { query: queryParams }),
)

const listData = computed((): ViewListData[] => dataApi.value?.Data ?? [])
const totalData = computed(() => dataApi.value?.TotalCount ?? 0)

// === OPEN FORM ===
const openAddDialog = () => {
  currentDetail.value = { Id: '', Name: '', Access: '', Keterangan: '', Photo: '' }
  dialogEditMode.value = false
  isNewCardDialogVisible.value = true
}

const openEditDialog = (row: ViewListData) => {
  currentDetail.value = { ...row }
  dialogEditMode.value = true
  isNewCardDialogVisible.value = true

  console.log(currentDetail.value)
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
    const res = await $api(`/api/Role/${selectedData.value.Id}`, {
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
</script>

<template>
  <div>
    <!-- Filter -->
    <VCard
      title="Group Akses"
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

        <VSpacer />

        <div class="d-flex gap-4 flex-wrap align-center">
          <AppSelect
            v-model="itemsPerPage"
            :items="[5, 10, 20, 25, 50]"
          />
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
        <template #item.Name="{ item }">
          <div class="d-flex align-center gap-x-4">
            <!--
              <VAvatar
              rounded
              size="30"
              class="me-6"
              :image="item.Photo || avatar1"
              />
            -->
            <VAvatar
              size="34"
              :variant="!item.Photo ? 'tonal' : undefined"
              :color="!item.Photo ? 'success' : undefined"
            >
              <VImg
                v-if="item.Photo"
                :src="item.Photo"
              />
              <span v-else>{{ avatarText(item.Name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                {{ item.Name }}
              </h6>
            </div>
          </div>
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
  <FormGoup
    :key="currentDetail?.Id ?? 'new'"
    v-model:is-dialog-visible="isNewCardDialogVisible"
    :card-details="currentDetail"
    :is-edit-mode="dialogEditMode"
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
