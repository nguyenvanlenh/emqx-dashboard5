<template>
  <div class="bridge-detail">
    <div class="detail-top">
      <detail-header v-if="!isFromRule" :item="{ name: sourceInfo.name, route: backRoute }">
        <template #content>
          <div class="vertical-align-center">
            <img :src="getBridgeIcon(sourceInfo.type)" />
            <p class="block-title">{{ sourceInfo.name }}</p>
            <TargetItemStatus type="action" :target="sourceInfo" is-tag />
            <el-tag type="info" class="section-status">
              {{ getGeneralTypeLabel(sourceInfo.type) }}
            </el-tag>
          </div>
        </template>
        <template #extra>
          <el-tooltip
            :content="sourceInfo.enable ? $t('Base.disable') : $t('Base.enable')"
            placement="top"
          >
            <el-switch class="enable-btn" v-model="sourceInfo.enable" @change="toggleEnable" />
          </el-tooltip>
          <el-tooltip :content="tl('createRule')" placement="top">
            <el-button
              class="icon-button"
              type="primary"
              :icon="Share"
              plain
              @click="createRuleWithSource"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('Base.delete')" placement="top">
            <el-button class="icon-button" type="danger" :icon="Delete" @click="handleDelete" plain>
            </el-button>
          </el-tooltip>
        </template>
      </detail-header>
    </div>
    <el-tabs :class="['detail-tabs', { 'hide-tabs': isFromRule }]" v-model="activeTab">
      <div :class="{ 'app-wrapper': !isFromRule, 'detail-main': true }">
        <el-tab-pane v-if="!isFromRule" :label="tl('overview')" :name="Tab.Overview" lazy>
          <div
            class="overview-container"
            :class="{ 'is-loading': infoLoading }"
            v-loading="infoLoading"
          >
            <BridgeItemOverview
              v-if="!infoLoading"
              is-source
              :bridge-id="id"
              :bridge-msg="sourceInfo"
              @reconnect="getSourceInfo"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane :label="t('Base.setting')" :name="Tab.Setting">
          <el-alert v-if="pwdErrorWhenCoping" :title="pwdErrorWhenCoping" type="error" />
          <el-card
            v-loading="isSettingCardLoading"
            :class="['app-card', isFromRule && 'app-inline-card']"
            :shadow="isFromRule ? 'never' : undefined"
          >
            <div class="setting-area" :style="{ width: isFromRule ? '100%' : '75%' }">
              <component
                ref="FormComEl"
                :is="formCom"
                v-model="sourceInfo"
                edit
                :type="sourceType"
                :disabled="disabled"
                :hide-name="hideName"
                v-bind="formComProps"
                @init="resetRawBridgeInfoAfterComponentInit"
              />
            </div>
            <div v-if="!isFromRule" class="btn-area">
              <el-button
                v-if="sourceInfo.type"
                type="primary"
                plain
                :loading="isTesting"
                @click="testConnection"
              >
                {{ tl('testTheConnection') }}
              </el-button>
              <el-button
                type="primary"
                v-if="sourceInfo.type"
                :loading="updateLoading"
                @click="updateSourceInfo()"
              >
                {{ $t('Base.update') }}
              </el-button>
            </div>
          </el-card>
        </el-tab-pane>
      </div>
    </el-tabs>
    <DeleteBridgeSecondConfirm
      v-model="showSecondConfirm"
      :rule-list="usingBridgeRules"
      :id="currentDeleteBridgeId"
      :direction="BridgeDirection.Ingress"
      @submitted="handleDeleteSuc"
    />
  </div>
</template>

<script lang="ts" setup>
import { BRIDGE_TYPES_NOT_USE_SCHEMA } from '@/common/constants'
import { customValidate } from '@/common/tools'
import DetailHeader from '@/components/DetailHeader.vue'
import useHandleSourceItem, { useDeleteSource } from '@/hooks/Rule/action/useHandleSourceItem'
import { useBridgeTypeIcon, useBridgeTypeValue } from '@/hooks/Rule/bridge/useBridgeTypeValue'
import useCheckBeforeSaveAsCopy from '@/hooks/Rule/bridge/useCheckBeforeSaveAsCopy'
import useI18nTl from '@/hooks/useI18nTl'
import { useReceiveParams } from '@/hooks/usePaginationRemember'
import { BridgeDirection } from '@/types/enum'
import { Source } from '@/types/rule'
import { Delete, Share } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cloneDeep, isEqual, omit } from 'lodash'
import type { Ref } from 'vue'
import { computed, defineExpose, defineProps, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BridgeItemOverview from '../Bridge/Components/BridgeItemOverview.vue'
import DeleteBridgeSecondConfirm from '../Bridge/Components/DeleteBridgeSecondConfirm.vue'
import TargetItemStatus from '../components/TargetItemStatus.vue'
import useSourceFormComponent from './components/useSourceFormComponent'

// TODO: split mqtt, add source overview, add DeleteBridgeSecondConfirm

enum Tab {
  Overview = 'overview',
  Setting = 'settings',
}

const route = useRoute()
const router = useRouter()
const { getBackRoute } = useReceiveParams('source')
const backRoute = computed(() => getBackRoute({ name: 'source' }))

// for compare when update
let rawSourceInfo: undefined | Source = undefined
const sourceInfo: Ref<Source> = ref({} as Source)
const infoLoading = ref(false)
const updateLoading = ref(false)
const activeTab = ref(Tab.Overview)
const props = defineProps({
  sourceId: {
    type: String,
    default: '',
  },
  /**
   * for viewing data
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * for rule
   */
  hideName: {
    type: Boolean,
    default: false,
  },
})
const FormComEl = ref()

const queryTab = computed(() => {
  return route.query.tab as Tab
})
if (queryTab.value) {
  activeTab.value = queryTab.value
}

const { getGeneralTypeLabel } = useBridgeTypeValue()
const { getBridgeIcon } = useBridgeTypeIcon()

const { tl, t } = useI18nTl('RuleEngine')

const isFromRule = computed(() => ['rule-detail', 'rule-create'].includes(route.name as string))
if (isFromRule.value && props.sourceId) {
  activeTab.value = Tab.Setting
}

const id = computed(() => {
  if (isFromRule.value) {
    return props.sourceId as string
  }
  return route.params.id as string
})

watch(id, (val) => {
  if (val && isFromRule.value) {
    getSourceInfo()
  }
})

const sourceType = computed(() => {
  const type = id.value.slice(0, id.value.indexOf(':'))
  return type
})
const { formCom, formComProps } = useSourceFormComponent(sourceType)
const isUsingSchemaForm = computed(() => {
  return !(BRIDGE_TYPES_NOT_USE_SCHEMA as Array<string>).includes(sourceType.value)
})
const isSettingCardLoading = computed(() => infoLoading.value && !isUsingSchemaForm.value)
const { getSourceDetail, updateSource, toggleSourceEnable, isTesting, testConnectivity } =
  useHandleSourceItem()

const getSourceInfo = async () => {
  infoLoading.value = true
  try {
    sourceInfo.value = await getSourceDetail(id.value)
    rawSourceInfo = cloneDeep(sourceInfo.value)
  } catch (error) {
    console.error(error)
  } finally {
    infoLoading.value = false
  }
}

/**
 * because each component will fill empty value to the bridgeInfo, so we need to
 * reset the raw bridge info to prevent compare error
 */
const resetRawBridgeInfoAfterComponentInit = (bridgeInfo: Source) => {
  rawSourceInfo = cloneDeep(bridgeInfo)
}

const setBridgeInfoFromSchemaForm = () => {
  if (isUsingSchemaForm.value) {
    sourceInfo.value = FormComEl.value.getFormRecord()
  }
}

const getDataForSubmit = () => {
  setBridgeInfoFromSchemaForm()
  return sourceInfo.value
}

const { pwdErrorWhenCoping } = useCheckBeforeSaveAsCopy()

const testConnection = async () => {
  try {
    await customValidate(FormComEl.value)
    isTesting.value = true
    const data = await getDataForSubmit()
    await testConnectivity(omit(data, 'id') as Source)
    ElMessage.success(tl('connectionSuccessful'))
  } catch (error) {
    //
  } finally {
    isTesting.value = false
  }
}

const updateSourceInfo = async () => {
  try {
    await customValidate(FormComEl.value)
    setBridgeInfoFromSchemaForm()

    // Check for changes before updating and do not request if there are no changes
    // TODO:check the schema form & MQTT
    if (isFromRule.value && isEqual(sourceInfo.value, rawSourceInfo)) {
      return Promise.resolve(sourceInfo.value.id)
    }

    await ElMessageBox.confirm(tl('updateSourceTip'), {
      confirmButtonText: t('Base.confirm'),
      cancelButtonText: t('Base.cancel'),
      type: 'warning',
    })

    updateLoading.value = true
    const data = await getDataForSubmit()
    const res = await updateSource(data)
    if (!isFromRule.value) {
      ElMessage.success(t('Base.updateSuccess'))
      router.push({ name: 'source' })
    }
    updateLoading.value = false
    return Promise.resolve(res.id)
  } catch (error) {
    updateLoading.value = false
    return Promise.reject(error)
  }
}

const toggleEnable = async () => {
  infoLoading.value = true
  const { enable } = sourceInfo.value
  const sucMessage = enable ? 'Base.enableSuccess' : 'Base.disabledSuccess'
  try {
    await toggleSourceEnable(sourceInfo.value.id, enable)
    ElMessage.success(t(sucMessage))
    getSourceInfo()
  } catch (error) {
    console.error(error)
  } finally {
    infoLoading.value = false
  }
}

const createRuleWithSource = () => {
  ElMessageBox.confirm(tl('useSourceCreateRule'), {
    confirmButtonText: t('Base.confirm'),
    cancelButtonText: t('Base.cancel'),
    type: 'success',
  })
    .then(() => {
      router.push({ name: 'rule-create', query: { sourceId: sourceInfo.value.id } })
    })
    .catch(() => ({}))
}

const goBack = () => {
  router.push({ name: 'source' })
}
const {
  showSecondConfirm,
  usingBridgeRules,
  currentDeleteBridgeId,
  handleDeleteSuc,
  handleDeleteSource,
} = useDeleteSource(goBack)
const handleDelete = async () => {
  if (!id.value) {
    return
  }
  handleDeleteSource(sourceInfo.value)
}

onMounted(() => {
  getSourceInfo()
})

defineExpose({
  updateSourceInfo,
  testConnection,
})
</script>

<style lang="scss">
@import '~@/style/rule.scss';
</style>

<style lang="scss" scoped>
.setting-area {
  width: 75%;
  min-height: 400px;
}
.btn-area {
  margin-top: 24px;
  .el-button {
    margin-left: 0;
    margin-right: 12px;
  }
}
.hide-tabs {
  > :deep(.el-tabs__header) {
    display: none;
  }
}
.overview-container.is-loading {
  height: 600px;
}
.app-inline-card {
  min-height: 300px;
  overflow: visible;
  :deep(> .el-card__body) {
    padding: 0px;
  }
}
</style>
