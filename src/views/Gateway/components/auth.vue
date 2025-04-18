<template>
  <div>
    <div v-loading="loadingAuth">
      <div class="auth-create" v-if="!hasAuth">
        <CreateButton @click="openAuthCreate()">
          {{ tl('addAuth') }}
        </CreateButton>
        <div class="tips">
          {{ tl('noAuthTips') }}
        </div>
      </div>
      <el-card v-else>
        <authn-details
          :gateway-info="hasAuth"
          :update-func="authUpdate"
          :delete-func="authDelete"
          :gateway="gname"
        />
      </el-card>
    </div>
    <el-dialog class="gateway-auth-dialog" v-model="createDialog" width="75%" destroy-on-close>
      <authn-create
        :gateway="gname"
        :cancel-func="cancelCreate"
        :create-func="authCreate"
        :disabled-databases="disabledDatabases"
        :disabled-mechanisms="disabledMechanism"
        :preset-authn-data="presetAuthnData"
      />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GatewayDetailAuth',
}
</script>

<script setup>
import { computed, ref } from 'vue'
import { getGatewayAuth, updateGatewayAuth, deleteGatewayAuth, addGatewayAuth } from '@/api/gateway'
import AuthnCreate from '../../Auth/AuthnCreate.vue'
import AuthnDetails from '../../Auth/AuthnDetails.vue'
import { ElMessage as M } from 'element-plus'
import { useRoute } from 'vue-router'
import { cloneDeep, omit } from 'lodash'
import { GATEWAY_ENABLED_DATABASES_MAP, GATEWAY_ENABLED_MECHANISM_MAP } from '@/common/constants'
import useI18nTl from '@/hooks/useI18nTl'
import { GatewayName, AuthnMechanismType, DatabasesType } from '@/types/enum.ts'

const presetAuthnDataMap = {
  [GatewayName.MQTT_SN]: [
    {
      mechanism: AuthnMechanismType.PasswordBased,
      subtype: 'http',
      data: { body: { clientid: '${clientid}' } },
    },
  ],
  [GatewayName.LwM2M]: [
    {
      mechanism: AuthnMechanismType.PasswordBased,
      subtype: 'http',
      data: { body: { endpoint_name: '${endpoint_name}' } },
    },
  ],
}

let createDialog = ref(false)
let hasAuth = ref(false)
let loadingAuth = ref(true)
const { t, tl } = useI18nTl('Gateway')
const route = useRoute()
const gname = String(route.params.name).toLowerCase()

const allMechanism = Object.values(AuthnMechanismType)
const disabledMechanism = computed(() => {
  const enabledMechanism = GATEWAY_ENABLED_MECHANISM_MAP[gname]
  return allMechanism.filter((mechanism) => !enabledMechanism.includes(mechanism))
})

const allDatabases = Object.values(DatabasesType)
const disabledDatabases = computed(() => {
  const enabledDatabases = GATEWAY_ENABLED_DATABASES_MAP[gname]
  return allDatabases.filter((database) => !enabledDatabases.includes(database))
})

const presetAuthnData = computed(() => {
  return presetAuthnDataMap[gname] || undefined
})

const openAuthCreate = async function () {
  createDialog.value = true
}

const getAuthInfo = async function () {
  try {
    loadingAuth.value = true
    let res = await getGatewayAuth(gname)
    if (res === 204) {
      hasAuth.value = false
    } else if (res) {
      hasAuth.value = res
    }
  } catch (error) {
    //
  } finally {
    loadingAuth.value = false
  }
}

const cancelCreate = function () {
  createDialog.value = false
}

const authCreate = async function (data) {
  try {
    const gData = {
      ...data.data,
      enable: true,
    }
    await addGatewayAuth(gname, gData)
    createDialog.value = false
    M.success(t('Base.createSuccess'))
    getAuthInfo()
  } catch (error) {
    return Promise.reject(error)
  }
}

const authUpdate = async function (data) {
  try {
    await updateGatewayAuth(gname, omit(cloneDeep(data), ['id', 'chain_name']))
    M.success(t('Base.updateSuccess'))
    getAuthInfo()
  } catch (error) {
    //
  }
}

const authDelete = async function () {
  try {
    await deleteGatewayAuth(gname)
    hasAuth.value = false
    M.success(t('Base.deleteSuccess'))
  } catch (error) {
    //
  }
}

getAuthInfo()
</script>

<style lang="scss" scoped>
.auth-create {
  min-height: 200px;
  margin: 20px auto;
  padding-top: 32px;
  text-align: center;
  .tips {
    width: 60%;
    margin: 20px auto;
  }
}

.el-dialog__wrapper :deep(.el-dialog) {
  width: 75%;
}
</style>

<style lang="scss">
.gateway-auth-dialog {
  .el-card.app-card {
    margin-bottom: 0;
  }
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 12px;
    .authn-create {
      padding-top: 8px;
    }
  }
}
</style>
