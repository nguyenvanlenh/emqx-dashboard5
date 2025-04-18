<template>
  <div class="metrics app-wrapper">
    <div class="header-block">
      <div class="header-item">
        <p class="tip">{{ tl('packetStatisticsOfNodes') }}</p>
      </div>
      <div class="header-item">
        <el-select
          class="node-select"
          v-model="currentNode"
          :placeholder="$t('Clients.node')"
          @change="loadMetricsData"
        >
          <el-option :label="$t('BasicConfig.cluster')" :value="CLUSTER_VALUE" />
          <el-option v-for="node in nodeOpts" :key="node" :label="node" :value="node" />
        </el-select>
        <RefreshButton @click="handleSearch" />
      </div>
    </div>
    <el-row class="content-block" :gutter="26">
      <el-col :span="8">
        <el-card class="top-border table-card client">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'client')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('connection')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-border table-card session">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'session')"
            v-loading.lock="isDataLoading"
            class="stripe-reverse"
          >
            <el-table-column prop="m" min-width="160" :label="tl('session')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-border table-card auth">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'authorization')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('auth')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <h2>
      {{ $t('Dashboard.messaging') }}
    </h2>
    <el-row class="content-block" :gutter="26">
      <el-col :span="8">
        <el-card class="top-border table-card bytes">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'bytes')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('traffic')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
        <el-card class="top-border table-card packets">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'packets')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('mqttPackets')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-border table-card messages">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'messages')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('messageNumber')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="top-border table-card delivery">
          <el-table
            stripe
            :data="filterMetrics(currentMetrics, 'delivery')"
            v-loading.lock="isDataLoading"
          >
            <el-table-column prop="m" min-width="160" :label="tl('delivery')">
              <template #default="{ row }">
                <p class="raw-key">{{ row.rawKey }}</p>
                <span class="desc">{{ row.m ? tl(row.m) : '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="v" sortable class-name="sortable-without-header-text" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Metrics',
})
</script>

<script setup lang="ts">
import { loadMetrics, loadNodes } from '@/api/common'
import useI18nTl from '@/hooks/useI18nTl'
import { NodeStatisticalData } from '@/types/dashboard'
import { snakeCase } from 'lodash'
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'

interface MetricItem {
  [propName: string]: string | number
}

const nodeOpts: Ref<Array<string>> = ref([])
const CLUSTER_VALUE = 'cluster'
const currentNode: Ref<string> = ref(CLUSTER_VALUE)

const isDataLoading: Ref<boolean> = ref(true)

const currentMetrics = ref<NodeStatisticalData>({} as NodeStatisticalData)

const { tl } = useI18nTl('Dashboard')

const loadMetricsData = async () => {
  try {
    isDataLoading.value = true
    const node = currentNode.value === CLUSTER_VALUE ? undefined : currentNode.value
    const data = await loadMetrics(node)
    if (Array.isArray(data) && data.length === 1) {
      currentMetrics.value = data[0]
    } else if (!Array.isArray(data)) {
      currentMetrics.value = data
    }
  } catch (error) {
    //
  } finally {
    isDataLoading.value = false
  }
}

const loadNodeOpts = async () => {
  try {
    const nodes = await loadNodes()
    nodeOpts.value = nodes.map(({ node }) => node)
  } catch (error) {
    //
  }
}

// FIXME: Temporary data filter, separating Auth in Client, awit API
function filterMetrics(data: MetricItem, key: string) {
  let keys: Array<{ m: string; v: number; rawKey: string }> = []
  Object.keys(data || []).forEach((v) => {
    if (v.startsWith(key)) {
      keys.push({ m: snakeCase(v), v: data[v] as number, rawKey: v })
    }
  })
  if (key === 'client') {
    keys = keys.filter((item) => !item.m.includes('auth'))
  }
  keys = keys.sort((pre, next) => pre.m.localeCompare(next.m))
  if (key === 'authorization') {
    const _authKeys: Array<{ m: string; v: number; rawKey: string }> = []
    Object.keys(data || []).forEach((v) => {
      if (v.startsWith('client') && v.includes('auth')) {
        _authKeys.push({ m: snakeCase(v), v: data[v] as number, rawKey: v })
      }
    })
    keys.push(..._authKeys)
  }
  return keys
}

const handleSearch = () => {
  loadMetricsData()
}

onMounted(() => {
  loadNodeOpts()
  loadMetricsData()
})
</script>

<style lang="scss">
.metrics {
  .header-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    margin-top: 14px;
    .node-select.el-select {
      width: 320px;
      margin-right: 12px;
    }
  }
  .content-block {
    .el-card {
      &.top-border.client {
        &:before {
          background: #00b299;
        }
      }
      &.top-border.auth {
        &:before {
          background: #66cfda;
        }
      }
      &.top-border.delivery {
        &:before {
          background: #0f5b62;
        }
      }
      &.top-border.session {
        &:before {
          background: #5d4eff;
        }
      }
      &.top-border.packets {
        &:before {
          background: #3d7ff9;
        }
      }
      &.top-border.messages {
        &:before {
          background: #bf73ff;
        }
      }
      &.top-border.bytes {
        margin-bottom: 37px;
        &:before {
          background: #f49845;
        }
      }
    }
  }
  .stripe-reverse {
    &.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
      background-color: inherit;
    }
    &.el-table--striped .el-table__body tr:not(.el-table__row--striped) td.el-table__cell {
      background: var(--color-bg-split);
    }
  }
  .el-table {
    .raw-key {
      margin-top: 0;
      margin-bottom: 0;
    }
    .desc {
      display: block;
      margin-top: 4px;
      color: var(--color-text-secondary);
    }
  }
}
</style>
