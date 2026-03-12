<script setup lang="ts">
import avatar1 from '@images/avatars/profile-men.png'

// ===============================
// 🧩 Interface Definitions
// ===============================
interface Action {
  IdAction: string
  NamaAction: string
  NoUrut: number
}

interface Controller {
  IdController: string
  Controller: string
  ActionViewModel: Action[]
}

interface Menu {
  IdMenu: string
  NamaMenu: string
  ControllerViewModel: Controller[]
}

interface AccessItem {
  IdController: string
  IdAction: string
}

interface Details {
  Id: string
  Name: string
  Access: string
  Keterangan: string
  Photo: string
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

// ===============================
// 🧠 Props & Emits
// ===============================
const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    Id: '',
    Name: '',
    Access: '',
    Keterangan: '',
    Photo: avatar1,
  }),
  isEditMode: false,
})

const emit = defineEmits<Emit>()

// ===============================
// 📦 State
// ===============================
const menus = ref<Menu[]>([])

// const menus = ref<Menu[]>([
//   {
//     IdMenu: 'Akun',
//     NamaMenu: 'Akun',
//     ControllerViewModel: [
//       {
//         IdController: 'Role',
//         Controller: 'Role',
//         ActionViewModel: [
//           { IdAction: 'GetListRole', NamaAction: 'Lihat', NoUrut: 1 },
//           { IdAction: 'PostRole', NamaAction: 'Tambah', NoUrut: 2 },
//           { IdAction: 'PutRole', NamaAction: 'Edit', NoUrut: 3 },
//           { IdAction: 'DeleteRole', NamaAction: 'Hapus', NoUrut: 4 },
//         ],
//       },
//       {
//         IdController: 'Akun',
//         Controller: 'Akun',
//         ActionViewModel: [
//           { IdAction: 'GetListAkun', NamaAction: 'Lihat', NoUrut: 1 },
//           { IdAction: 'PostAkun', NamaAction: 'Tambah', NoUrut: 2 },
//           { IdAction: 'PutAkun', NamaAction: 'Edit', NoUrut: 3 },
//           { IdAction: 'DeleteAkun', NamaAction: 'Hapus', NoUrut: 4 },
//         ],
//       },
//     ],
//   },
// ])

const selectedMenu = ref<string | null>(null)
const selectedController = ref<string | null>(null)
const selectedAccess = ref<Record<string, Record<string, boolean>>>({})
const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)))

const refInputEl = ref<HTMLElement>()
const isSubmitting = ref(false)

// Snackbar
const isSnackbarScaleVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// ===============================
// 🌐 Fetch Menu Access Data
// ===============================
const fetchMenus = async (): Promise<void> => {
  try {
    const res = await $api('/api/Role/accesRole', { method: 'GET' })

    menus.value = res as Menu[]

    // if (res?.Metadata?.Code === '200') {
    //   menus.value = res as Menu[]
    //   console.log('Menu akses:', menus.value)
    // }
    // else {
    //   console.error('Gagal ambil menu akses:', res?.Metadata?.Message)
    // }
  }
  catch (err) {
    console.error('Error fetch accesRole:', err)
  }
}

// ===============================
// 🔁 Sync Props <-> Local Data
// ===============================
watch(
  () => props.cardDetails,
  newVal => {
    cardDetails.value = structuredClone(toRaw(newVal))
  },
  { deep: true, immediate: true },
)

watch(
  () => props.cardDetails?.Access,
  (accessStr: string | undefined) => {
    if (!accessStr)
      return

    try {
      const parsedAccess: AccessItem[] = JSON.parse(accessStr)
      const map: Record<string, Record<string, boolean>> = {}

      parsedAccess.forEach(a => {
        if (!map[a.IdController])
          map[a.IdController] = {}
        map[a.IdController][a.IdAction] = true
      })

      selectedAccess.value = map
      console.log('Loaded Access:', selectedAccess.value)
    }
    catch (err) {
      console.error('Gagal parse access JSON:', err)
    }
  },
  { immediate: true },
)

// ===============================
// 🖼️ Upload & Reset Avatar
// ===============================
const changeAvatar = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  const maxSize = 100 * 1024 // 100 KB

  if (!validTypes.includes(file.type)) {
    snackbarMessage.value = 'Format file tidak valid (hanya JPG, PNG, GIF)'
    snackbarColor.value = 'error'
    isSnackbarScaleVisible.value = true

    return
  }

  if (file.size > maxSize) {
    snackbarMessage.value = 'Ukuran file maksimal 100KB'
    snackbarColor.value = 'error'
    isSnackbarScaleVisible.value = true

    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    if (typeof reader.result === 'string')
      cardDetails.value.Photo = reader.result
  }
  reader.readAsDataURL(file)
}

const resetAvatar = (): void => {
  cardDetails.value.Photo = avatar1
}

// ===============================
// ✅ Form Validation
// ===============================
const validateForm = (): string | null => {
  if (!cardDetails.value.Name.trim())
    return 'Nama Group harus diisi'

  return null
}

// ===============================
// 🚪 Dialog & Submission
// ===============================
const dialogModelValueUpdate = (val: boolean): void => {
  emit('update:isDialogVisible', val)
}

const submitOrderCencon = async (): Promise<void> => {
  try {
    isSubmitting.value = true

    const selectedActions = Object.entries(selectedAccess.value).flatMap(
      ([controller, actions]) =>
        Object.entries(actions)
          .filter(([_, active]) => active)
          .map(([action]) => ({ IdController: controller, IdAction: action })),
    )

    const errorMsg = validateForm()
    if (errorMsg) {
      snackbarMessage.value = errorMsg
      snackbarColor.value = 'error'
      isSnackbarScaleVisible.value = true

      return
    }

    const payload = {
      Id: cardDetails.value.Id,
      Name: cardDetails.value.Name,
      Access: JSON.stringify(selectedActions),
      Keterangan: cardDetails.value.Keterangan,
      Photo: cardDetails.value.Photo,
    }

    const method = props.isEditMode ? 'PUT' : 'POST'
    const url = props.isEditMode ? `api/Role/${cardDetails.value.Id}` : 'api/Role'

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
    console.error('Gagal submit data:', error)
    snackbarMessage.value = 'Gagal submit data!'
    snackbarColor.value = 'error'
    isSnackbarScaleVisible.value = true
  }
  finally {
    isSubmitting.value = false
  }
}

// ===============================
// 🧭 Group Access Control
// ===============================
const selectMenu = (idMenu: string): void => {
  selectedMenu.value = idMenu
  selectedController.value = null
}

const selectController = (idController: string): void => {
  selectedController.value = idController
}

const toggleAccess = (controller: string, idAction: string): void => {
  if (!selectedAccess.value[controller])
    selectedAccess.value[controller] = {}
  selectedAccess.value[controller][idAction]
    = !selectedAccess.value[controller][idAction]
}

// Load menus on mount
fetchMenus()
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            {{ props.isEditMode ? 'EDIT GROUP AKSES' : 'ADD GROUP AKSES' }}
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
                v-model="cardDetails.Name"
                label="Nama Group"
                placeholder="Superadmin"
                autocomplete="off"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="cardDetails.Keterangan"
                label="Keterangan Group Akses"
                placeholder="Full Akses"
                autocomplete="off"
              />
            </VCol>

            <!--
              <VCol cols="12">
              <AppTextField
              v-model="cardDetails.Jabatan"
              label="Jabatan"
              placeholder="Nama Jabatan Desa"
              autocomplete="off"
              />
              </VCol>
            -->

            <VCol
              cols="12"
              class="text-center"
            >
              <VBtn
                class="me-4"
                type="submit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
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

          <VRow>
            <!-- === MENU === -->
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-subtitle-2 mb-2">
                Menu
              </div>
              <VList
                density="compact"
                nav
              >
                <VListItem
                  v-for="menu in menus"
                  :key="menu.IdMenu"
                  :active="selectedMenu === menu.IdMenu"
                  class="cursor-pointer"
                  @click="selectMenu(menu.IdMenu)"
                >
                  <VListItemTitle>{{ menu.NamaMenu }}</VListItemTitle>
                </VListItem>
              </VList>
            </VCol>

            <!-- === SUB MENU === -->
            <VCol
              v-if="selectedMenu"
              cols="12"
              md="4"
            >
              <div class="text-subtitle-2 mb-2">
                Sub Menu
              </div>
              <VList
                density="compact"
                nav
              >
                <div style="max-block-size: 300px; overflow-y: auto;">
                  <VListItem
                    v-for="ctrl in menus.find(m => m.IdMenu === selectedMenu)?.ControllerViewModel || []"
                    :key="ctrl.IdController"
                    :active="selectedController === ctrl.IdController"
                    class="cursor-pointer"
                    @click="selectController(ctrl.IdController)"
                  >
                    <VListItemTitle>{{ ctrl.Controller }}</VListItemTitle>
                  </VListItem>
                </div>
              </VList>
            </VCol>

            <!-- === ROLE (Aksi) === -->
            <VCol
              v-if="selectedController"
              cols="12"
              md="5"
            >
              <div class="text-subtitle-2 mb-2">
                Hak Akses
              </div>
              <VCard
                variant="tonal"
                class="pa-3"
              >
                <div
                  v-for="act in (menus
                    .find(m => m.IdMenu === selectedMenu)
                    ?.ControllerViewModel.find(c => c.IdController === selectedController)?.ActionViewModel || [])"
                  :key="act.IdAction"
                  class="d-flex align-center justify-space-between mb-2"
                >
                  <span>{{ act.NamaAction }}</span>
                  <VSwitch
                    density="compact"
                    hide-details
                    inset
                    color="primary"
                    :model-value="selectedAccess[selectedController]?.[act.IdAction] || false"
                    @update:model-value="() => toggleAccess(selectedController, act.IdAction)"
                  />
                </div>
              </VCard>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

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

<style lang="scss">
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
  padding-inline: 12px !important;
}
</style>
