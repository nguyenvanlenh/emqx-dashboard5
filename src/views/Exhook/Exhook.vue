<template>
  <div class="exhook app-wrapper">
    <div class="section-header">
      <div></div>
      <CreateButton @click="addExhook">
        {{ t('Base.add') }}
      </CreateButton>
    </div>
    <el-table
      ref="tableCom"
      class="exhook-table table-with-draggable"
      :data="exhooks"
      v-loading.lock="isTableLoading"
      row-key="name"
    >
      <el-table-column prop="name" :label="tl('name')" :min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          <router-link :to="exhookDetailRoute(row)" class="table-data-without-break">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="tl('numberOfHooks')" :min-width="144" prop="hooks.length" />
      <el-table-column :label="t('Base.success')" :min-width="100" prop="metrics.succeed" />
      <el-table-column :label="t('Base.failed')" :min-width="100" prop="metrics.failed" />
      <el-table-column
        :label="`${tl('rate')}(${tl('second')})`"
        :min-width="136"
        prop="metrics.rate"
      />

      <el-table-column prop="enable" :label="$t('Base.isEnabled')" :min-width="92">
        <template #default="{ row }">
          <el-switch v-model="row.enable" @change="changeExhookStatus(row)" />
        </template>
      </el-table-column>
      <!-- FIXME: -->
      <el-table-column :label="tl('status')" :min-width="128">
        <template #default="{ row }">
          <ExhookItemStatus :exhook="row" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Base.operation')" :min-width="232">
        <template #default="{ row, $index }">
          <TableButton @click="goExhookDetail(row, 'hooks')">
            {{ tl('hooks') }}
          </TableButton>
          <TableButton @click="goExhookDetail(row, 'settings')">
            {{ $t('Base.setting') }}
          </TableButton>
          <TableItemDropdown
            :row-data="row"
            :table-len="exhooks.length"
            :row-index="$index"
            @move-up="moveExhookUp($index)"
            @move-down="moveExhookDown($index)"
            @move-to-top="moveExhookItemToTop"
            @move-to-bottom="moveExhookItemToBottom"
            @delete="handleDeleteExhook(row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import TableItemDropdown from './components/TableItemDropdown.vue'
import { nextTick, ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useHandleExhookItem from '@/hooks/Exhook/useHandleExhookItem'
import { Exhook } from '@/types/systemModule'
import { queryExhooks } from '@/api/exhook'
import useSortableTable from '@/hooks/useSortableTable'
import { SortableEvent } from 'sortablejs'
import ExhookItemStatus from './components/ExhookItemStatus.vue'
import useMove from '@/hooks/useMove'

const router = useRouter()
const { t } = useI18n()

const exhooks: Ref<Array<Exhook>> = ref([])
const isTableLoading = ref(false)

const tl = (key: string, moduleName = 'Exhook') => t(`${moduleName}.${key}`)

const emptyExhooks = () => {
  exhooks.value = []
}

const getExhooks = async () => {
  isTableLoading.value = true
  exhooks.value = await queryExhooks()
  isTableLoading.value = false
  await nextTick()
  initSortable()
}

const addExhook = () => {
  router.push({ name: 'exhook-create' })
}

const {
  deleteExhook,
  updateExhookEnable,
  moveExhookToTop,
  moveExhookToBottom,
  moveExhookBeforeAnotherExhook,
  moveExhookAfterAnotherExhook,
} = useHandleExhookItem()

const moveExhookUp = (index: number) => handleDragEvent(index - 1, index, exhooks.value)
const moveExhookDown = (index: number) => handleDragEvent(index + 1, index, exhooks.value)

const moveExhookItemToTop = async (row: Exhook) => {
  try {
    await moveExhookToTop(row)
  } catch (error) {
    // empty the array first when an error occurs, otherwise the view will not be updated
    exhooks.value = []
  } finally {
    getExhooks()
  }
}

const moveExhookItemToBottom = async (row: Exhook) => {
  try {
    await moveExhookToBottom(row)
  } catch (error) {
    // empty the array first when an error occurs, otherwise the view will not be updated
    exhooks.value = []
  } finally {
    getExhooks()
  }
}

const exhookDetailRoute = ({ name }: Exhook, tab?: string) => ({
  name: 'exhook-detail',
  params: { exhookName: name },
  query: { tab },
})

const goExhookDetail = (exhook: Exhook, tab?: string) => {
  router.push(exhookDetailRoute(exhook, tab))
}

const changeExhookStatus = async (exhook: Exhook) => {
  try {
    await updateExhookEnable(exhook, exhook.enable)
    getExhooks()
  } catch (error) {
    //
  }
}

const handleDeleteExhook = async (exhook: Exhook) => {
  await deleteExhook(exhook.name)
  getExhooks()
}

const { handleDragEvent } = useMove(
  {
    moveToBottom: moveExhookToBottom,
    moveToTop: moveExhookToTop,
    moveBeforeAnotherTarget: moveExhookBeforeAnotherExhook,
    moveAfterAnotherTarget: moveExhookAfterAnotherExhook,
  },
  emptyExhooks,
  getExhooks,
)

const handleOrderChanged = async (evt: SortableEvent) => {
  const { newIndex, oldIndex } = evt
  if (newIndex === undefined || oldIndex === undefined) {
    return
  }
  handleDragEvent(newIndex, oldIndex, exhooks.value)
}

const { tableCom, initSortable } = useSortableTable(handleOrderChanged)

getExhooks()
</script>
