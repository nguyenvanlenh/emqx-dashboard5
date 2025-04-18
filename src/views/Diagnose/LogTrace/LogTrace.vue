<template>
  <div class="log-trace app-wrapper">
    <div class="section-header">
      <div></div>
      <div>
        <CreateButton @click="openCreateDialog" />
      </div>
    </div>

    <el-table :data="traceTable" v-loading="traceTbLoading" class="data-table">
      <el-table-column :label="$t('LogTrace.name')" prop="name" :min-width="100">
        <template #default="{ row }">
          <router-link :to="{ name: 'log-trace-detail', params: { id: row.name } }">
            {{ row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('LogTrace.type')" prop="type" :min-width="100">
        <template #default="{ row }">
          {{ getTypeLabelByValue(row.type) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('LogTrace.condition')" :min-width="100">
        <template #default="{ row }">
          {{ row[row.type] }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('LogTrace.startEndTime')"
        sortable
        :sort-by="({ start_at }: Record<string, string>) => new Date(start_at).getTime()"
        :min-width="188"
      >
        <template #default="{ row }">
          {{ moment(row.start_at).format('YYYY-MM-DD HH:mm:ss') }}
          <br />
          {{ moment(row.end_at).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('LogTrace.status')" prop="status" :min-width="120">
        <template #default="{ row }">
          <div class="vertical-align-center">
            <CheckIcon
              :status="
                row.status === 'running'
                  ? CheckStatus.Check
                  : row.status === 'stopped'
                  ? CheckStatus.Close
                  : CheckStatus.Disable
              "
            />
            <span>{{ row.status && $t('LogTrace.s' + row.status) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('LogTrace.logSize')"
        prop="totalLogSize"
        sortable
        :min-width="112"
      >
        <template #default="{ row }">
          {{ transMemorySizeNumToStr(row.totalLogSize, 2) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('LogTrace.payload')" :min-width="100">
        <template #default="{ row }">
          {{ getEncodeTypeLabelByValue(row.payload_encode) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('Base.operation')" :min-width="220">
        <template #default="{ row }">
          <TableButton @click="download(row)" :loading="row.isLoading">
            {{ $t('LogTrace.download') }}
          </TableButton>
          <template v-if="row.status !== 'stopped'">
            <TableButton type="danger" plain @click="stopTraceHandler(row)">
              {{ $t('LogTrace.stop') }}
            </TableButton>
          </template>
          <template v-else>
            <TableButton plain @click="deleteTraceHandler(row)">
              {{ $t('LogTrace.delete') }}
            </TableButton>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="$t('LogTrace.createLog')"
      v-model="createDialog"
      @close="initForm"
      width="800px"
    >
      <el-form
        ref="createForm"
        label-position="top"
        require-asterisk-position="right"
        :model="record"
        :rules="createRules"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('LogTrace.name')" prop="name">
              <el-input v-model="record.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('LogTrace.type')" prop="type">
              <el-select v-model="record.type">
                <el-option
                  v-for="{ value, label } in typeOptions"
                  :key="value"
                  :value="value"
                  :label="label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="record.type === LogTraceType.Topic">
            <el-form-item :label="$t('Base.topic')" prop="topic">
              <el-input v-model="record.topic" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="record.type === LogTraceType.ClientID">
            <el-form-item :label="$t('Base.clientid')" prop="clientid">
              <el-input v-model="record.clientid" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="record.type === LogTraceType.IPAddress">
            <el-form-item :label="$t('Base.ip')" prop="ip_address">
              <el-input v-model="record.ip_address" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="record.type === LogTraceType.RuleID">
            <el-form-item :label="`${startCase(t('RuleEngine.rule'))} ID`" prop="ruleid">
              <el-input v-model="record.ruleid" />
            </el-form-item>
          </el-col>
          <el-col :span="12" style="clear: both">
            <el-form-item :label="$t('LogTrace.startEndTime')" prop="startTime">
              <el-date-picker
                type="datetimerange"
                :start-placeholder="$t('LogTrace.startTime')"
                :end-placeholder="$t('LogTrace.endTime')"
                v-model="record.startTime"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="formatter" :label="tl('formatter')">
              <el-select v-model="record.formatter">
                <el-option
                  v-for="{ label, value } in formatterOpt"
                  :key="value"
                  :value="value"
                  :label="label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="payload_encode">
              <FormItemLabel
                :label="$t('LogTrace.payload')"
                :desc="$t('LogTrace.payloadDesc')"
                desc-marked
              />
              <el-select v-model="record.payload_encode">
                <el-option
                  v-for="{ label, value } in encodeTypeOpt"
                  :key="value"
                  :value="value"
                  :label="label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-align-footer">
          <el-button @click="cancelDialog()">{{ $t('Base.cancel') }}</el-button>
          <el-button
            class="dialog-primary-btn"
            type="primary"
            @click="submitTrace()"
            :loading="createLoading"
          >
            {{ $t('Base.create') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { addTrace, deleteTrace, downloadTrace, getTraceList, stopTrace } from '@/api/diagnose'
import { getLabelFromValueInOptionList, transMemorySizeNumToStr } from '@/common/tools'
import CheckIcon from '@/components/CheckIcon.vue'
import FormItemLabel from '@/components/FormItemLabel.vue'
import useFormRules from '@/hooks/useFormRules'
import { TraceFormRecord, TraceItem, TraceRecord } from '@/types/diagnose'
import { CheckStatus, LogTraceFormatter, LogTraceType, TraceEncodeType } from '@/types/enum'
import { ElForm, FormRules, ElMessage as M, ElMessageBox as MB } from 'element-plus'
import { omit, startCase } from 'lodash'
import moment from 'moment'
import type { Ref } from 'vue'
import { defineComponent, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const DEFAULT_DURATION = 30 * 60 * 1000

const createRawTraceForm = () => ({
  name: '',
  type: LogTraceType.ClientID,
  clientid: '',
  ip_address: '',
  topic: '',
  ruleid: '',
  startTime: ['', ''] as [string, string],
  payload_encode: TraceEncodeType.Text,
  formatter: LogTraceFormatter.Text,
})

type TraceItemInTable = TraceItem & {
  isLoading: boolean
}

export default defineComponent({
  components: {
    CheckIcon,
    FormItemLabel,
  },
  setup() {
    const { t } = useI18n()
    const traceTbLoading = ref(false)
    const traceTable: Ref<Array<TraceItemInTable>> = ref([])
    const createLoading = ref(false)
    const typeOptions = [
      {
        value: LogTraceType.ClientID,
        label: t('Base.clientid'),
      },
      {
        value: LogTraceType.Topic,
        label: t('Base.topic'),
      },
      {
        value: LogTraceType.IPAddress,
        label: t('Base.ip'),
      },
      {
        value: LogTraceType.RuleID,
        label: `${startCase(t('RuleEngine.rule'))} ID`,
      },
    ]
    const record: Ref<TraceFormRecord> = ref(createRawTraceForm())
    const createDialog = ref(false)
    const { createLetterStartRule } = useFormRules()
    const createRules: FormRules = {
      name: [{ required: true, message: t('General.pleaseEnter') }, ...createLetterStartRule()],
      topic: [{ required: true, message: t('General.pleaseEnter') }],
      clientid: [{ required: true, message: t('General.pleaseEnter') }],
      ip_address: [{ required: true, message: t('General.pleaseEnter') }],
      ruleid: [{ required: true, message: t('General.pleaseEnter') }],
      startTime: [
        {
          validator(r: any, v: Array<string>, cb: (error?: Error) => void) {
            // eslint-disable-next-line no-unused-expressions
            v && v[0] && v[1] ? cb() : cb(new Error(t('LogTrace.needStartTime')))
          },
        },
      ],
    }
    const createForm: Ref<typeof ElForm | null> = ref(null)

    const encodeTypeOpt = [
      { label: 'Text', value: TraceEncodeType.Text },
      { label: 'HEX', value: TraceEncodeType.HEX },
      { label: 'Hidden', value: TraceEncodeType.Hidden },
    ]

    const formatterOpt = [
      { label: 'JSON', value: LogTraceFormatter.JSON },
      { label: 'Text', value: LogTraceFormatter.Text },
    ]

    const countTotalLogSize = (sizeMap: Record<string, number>) => {
      return Object.keys(sizeMap).reduce((total, currentNode) => total + sizeMap[currentNode], 0)
    }

    const loadTraceList = async () => {
      traceTbLoading.value = true
      try {
        const traceList = await getTraceList()
        traceTable.value = traceList.map((item: any) => {
          return {
            ...item,
            totalLogSize: countTotalLogSize(item.log_size),
            // for download
            isLoading: false,
          }
        })
      } catch (error) {
        //
      } finally {
        traceTbLoading.value = false
      }
    }

    const getTypeLabelByValue = (value: string) => getLabelFromValueInOptionList(value, typeOptions)
    const getEncodeTypeLabelByValue = (value: string) =>
      getLabelFromValueInOptionList(value, encodeTypeOpt)

    const submitTrace = async () => {
      createForm.value?.validate(async (valid: boolean) => {
        if (!valid) return
        createLoading.value = true
        const { clientid, topic, ip_address, ruleid, startTime, type, formatter } = record.value
        let targetInfo: TraceRecord = {
          ...omit(record.value, ['clientid', 'topic', 'ip_address', 'startTime']),
          start_at: new Date(startTime[0]).toISOString(),
          end_at: new Date(startTime[1]).toISOString(),
          ...(formatter ? { formatter } : {}),
        }
        switch (type) {
          case LogTraceType.ClientID:
            targetInfo.clientid = clientid
            break
          case LogTraceType.Topic:
            targetInfo.topic = topic
            break
          case LogTraceType.IPAddress:
            targetInfo.ip_address = ip_address
            break
          case LogTraceType.RuleID:
            targetInfo.ruleid = ruleid
            break
          default:
            break
        }
        try {
          await addTrace(targetInfo)
          M.success(t('LogTrace.createSuc'))
          loadTraceList()
          cancelDialog()
        } catch (error) {
          //
        } finally {
          createLoading.value = false
        }
      })
    }

    const cancelDialog = () => {
      createDialog.value = false
    }

    const initForm = () => {
      record.value = createRawTraceForm()
    }

    const stopTraceHandler = async (row: TraceRecord) => {
      if (!row.name) return
      try {
        await stopTrace(row.name)
        M.success(t('LogTrace.stopSuc'))
        loadTraceList()
      } catch (error) {
        //
      }
    }

    const openCreateDialog = async () => {
      createDialog.value = true
      const timeNow = new Date()
      record.value.startTime = [timeNow, new Date(timeNow.getTime() + DEFAULT_DURATION)]
      await nextTick()
      createForm.value?.clearValidate()
    }

    const deleteTraceHandler = async (row: TraceRecord) => {
      if (!row.name) {
        return
      }
      try {
        await MB.confirm(t('LogTrace.confirmDeleteTrace'), {
          confirmButtonText: t('Base.confirm'),
          cancelButtonText: t('Base.cancel'),
          confirmButtonClass: 'confirm-danger',
          type: 'warning',
        })

        await deleteTrace(row.name)
        M.success(t('LogTrace.deleteSuc'))
        loadTraceList()
      } catch (error) {
        //
      }
    }

    const download = async (row: TraceItemInTable) => {
      if (!row.name) {
        return
      }
      try {
        row.isLoading = true
        await downloadTrace(row.name)
      } catch (error) {
        //
      } finally {
        row.isLoading = false
      }
    }

    onMounted(() => {
      loadTraceList()
    })

    return {
      t,
      tl: (key: string) => t('LogTrace.' + key),
      traceTbLoading,
      traceTable,
      CheckStatus,
      createForm,
      typeOptions,
      record,
      encodeTypeOpt,
      formatterOpt,
      LogTraceType,
      startCase,
      transMemorySizeNumToStr,
      getTypeLabelByValue,
      getEncodeTypeLabelByValue,
      submitTrace,
      stopTraceHandler,
      openCreateDialog,
      moment,
      download,
      deleteTraceHandler,
      createRules,
      createDialog,
      createLoading,
      cancelDialog,
      initForm,
    }
  },
})
</script>

<style></style>
