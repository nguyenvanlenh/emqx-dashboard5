<template>
  <div class="database-config config">
    <!-- Connect -->
    <el-form
      ref="formCom"
      class="create-form"
      label-position="top"
      require-asterisk-position="right"
      :model="databaseConfig"
      :rules="rules"
    >
      <div class="config-sub-block">
        <el-row :gutter="20">
          <el-col v-if="isRedis" :span="12">
            <el-form-item :label="$t('Auth.redisType')" prop="redis_type" required>
              <el-select v-model="databaseConfig.redis_type">
                <el-option value="single" :label="$t('Auth.single')" />
                <el-option value="sentinel" label="Sentinel" />
                <el-option value="cluster" label="Cluster" />
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="isMongoDB">
            <el-col :span="12">
              <el-form-item :label="$t('Auth.mongoType')" required prop="mongo_type">
                <el-select
                  v-model="databaseConfig.mongo_type"
                  @change="clearValidateAfterSomeFieldChanged"
                >
                  <el-option value="single" :label="$t('Auth.single')" />
                  <el-option value="rs" label="Replica Set" />
                  <el-option value="sharded" label="Sharding" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('Auth.srvRecord')" prop="srv_record">
                <el-switch v-model="databaseConfig.srv_record" />
              </el-form-item>
            </el-col>
          </template>
          <el-col v-if="isServers" :span="12">
            <el-form-item :label="$t('Auth.servers')" required prop="servers">
              <el-input v-model="databaseConfig.servers" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col v-else :span="12">
            <el-form-item :label="$t('Auth.server')" required prop="server">
              <el-input v-model="databaseConfig.server" />
            </el-form-item>
          </el-col>
          <el-col v-if="isMongoDB && databaseConfig.mongo_type === MongoType.Rs" :span="12">
            <el-form-item :label="$t('Auth.replicaSetName')" required prop="replica_set_name">
              <el-input v-model="databaseConfig.replica_set_name" />
            </el-form-item>
          </el-col>
          <!-- Redis -->
          <el-col v-if="isRedis && databaseConfig.redis_type === 'sentinel'" :span="12">
            <el-form-item :label="$t('Auth.sentinel')" prop="sentinel" required>
              <el-input v-model="databaseConfig.sentinel" />
            </el-form-item>
          </el-col>
          <!-- Basic -->
          <el-col :span="12" v-if="!(isRedis && databaseConfig.redis_type === 'cluster')">
            <el-form-item :label="$t('Auth.database')" required prop="database">
              <el-input v-if="!isRedis" v-model="databaseConfig.database" />
              <CustomInputNumber v-else v-model="databaseConfig.database" :min="0" />
            </el-form-item>
          </el-col>
          <el-col v-if="isMongoDB" :span="12">
            <el-form-item :label="$t('Auth.collection')" required prop="collection">
              <el-input v-model="databaseConfig.collection" />
            </el-form-item>
          </el-col>
          <el-col v-if="!isRedis" :span="12">
            <el-form-item :label="$t('Base.username')">
              <el-input v-model="databaseConfig.username" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Base.password')">
              <CustomInputPassword v-model="databaseConfig.password" />
            </el-form-item>
          </el-col>
          <el-col v-if="isAuthn && isMongoDB" :span="12">
            <el-form-item :label="$t('Auth.passwordHashField')">
              <el-input v-model="databaseConfig.password_hash_field" placeholder="password_hash" />
            </el-form-item>
          </el-col>
          <PasswordHashAlgorithmFormItems
            v-if="isAuthn"
            v-model="databaseConfig"
            @change="handleSaltChanged"
          />
          <template v-if="isMongoDB">
            <el-col v-if="isAuthn && isEnableSalt" :span="12">
              <el-form-item :label="$t('Auth.saltField')">
                <el-input v-model="databaseConfig.salt_field" placeholder="salt" />
              </el-form-item>
            </el-col>
            <template v-if="databaseConfig.mongo_type === 'rs'">
              <el-col :span="12">
                <el-form-item :label="$t('Auth.readMode')">
                  <el-select v-model="databaseConfig.r_mode">
                    <el-option value="master" label="master" />
                    <el-option value="slave_ok" label="slave_ok" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col v-if="databaseConfig.mongo_type === 'rs'" :span="12">
                <el-form-item :label="$t('Auth.writeMode')">
                  <el-select v-model="databaseConfig.w_mode">
                    <el-option value="safe" label="safe" />
                    <el-option value="unsafe" label="unsafe" />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
            <el-col v-if="isAuthn" :span="12">
              <el-form-item :label="$t('Auth.superuserField')">
                <el-input
                  v-model="databaseConfig.is_superuser_field"
                  :placeholder="$t('Auth.isSuperuser')"
                />
              </el-form-item>
            </el-col>
          </template>

          <el-col :span="24">
            <!-- TLS -->
            <CommonTLSConfig class="TLS-config" v-model="databaseConfig.ssl" :is-edit="isEdit" />
          </el-col>
        </el-row>
      </div>

      <!-- Auth Config -->
      <div class="config-sub-block">
        <el-row :gutter="20">
          <!-- <el-col :span="12" v-if="!isMongoDB">
            <el-form-item :label="t('RuleEngine.autoRestartInterval')">
              <Oneof
                v-model="databaseConfig.resource_opts.auto_restart_interval"
                :items="[{ type: 'duration' }, { symbols: ['infinity'], type: 'enum' }]"
              />
            </el-form-item>
          </el-col> -->
          <!-- MySQL & PgSQL -->
          <el-col :span="24" v-if="isMySQL || isPgSQL">
            <el-form-item required prop="query" class="label-whole-line">
              <template #label>
                <span>SQL</span>
                <el-button
                  size="small"
                  @click="setDefaultContent('query')"
                  class="button-in-label-line"
                >
                  {{ $t('Auth.setDefault') }}
                </el-button>
                <el-button class="help-btn" size="small" @click="toggleNeedHelp">
                  {{ $t('Base.help') }}
                </el-button>
              </template>
              <el-collapse-transition>
                <div class="help-container" v-if="needHelp">
                  <HelpBlock :auth-type="authType" :database-type="database" />
                </div>
              </el-collapse-transition>
              <div class="viewer-container" ref="monacoContainer">
                <monaco id="database-query" v-model="databaseConfig.query" lang="sql" />
              </div>
            </el-form-item>
          </el-col>
          <!-- Mongodb -->
          <el-col :span="24" v-else-if="isMongoDB">
            <el-form-item class="label-whole-line" prop="filter">
              <template #label>
                <span>{{ $t('Auth.filter') }}</span>
                <el-button
                  class="button-in-label-line"
                  size="small"
                  @click="setDefaultContent('filter')"
                >
                  {{ $t('Auth.setDefault') }}
                </el-button>
                <el-button class="help-btn" size="small" @click="toggleNeedHelp">
                  {{ $t('Base.help') }}
                </el-button>
              </template>
              <el-collapse-transition>
                <div class="help-container" v-if="needHelp">
                  <HelpBlock :auth-type="authType" :database-type="database" />
                </div>
              </el-collapse-transition>
              <div class="viewer-container" ref="monacoContainer">
                <monaco
                  id="database-filter"
                  v-model="databaseConfig.filter"
                  lang="json"
                  json-without-validate
                />
              </div>
            </el-form-item>
          </el-col>
          <!-- Redis -->
          <el-col :span="24" v-else-if="isRedis">
            <el-form-item required prop="cmd" class="label-whole-line">
              <template #label>
                <span>{{ $t('Auth.cmd') }}</span>
                <el-button
                  class="button-in-label-line"
                  size="small"
                  @click="setDefaultContent('cmd')"
                >
                  {{ $t('Auth.setDefault') }}
                </el-button>
                <el-button class="help-btn" size="small" @click="toggleNeedHelp">
                  {{ $t('Base.help') }}
                </el-button>
              </template>
              <el-collapse-transition>
                <div class="help-container" v-if="needHelp">
                  <HelpBlock :auth-type="authType" :database-type="database" />
                </div>
              </el-collapse-transition>
              <div class="viewer-container" ref="monacoContainer">
                <monaco id="database-cmd" v-model="databaseConfig.cmd" lang="sql" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <AdvancedSettingContainer>
          <el-row :gutter="20">
            <template v-if="isMongoDB">
              <el-col :span="12">
                <el-form-item :label="$t('Auth.mongoAuthSource')">
                  <el-input v-model="databaseConfig.auth_source" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <FormItemLabel
                    :label="t('BridgeSchema.mongodb.use_legacy_protocol.label')"
                    :desc="t('BridgeSchema.mongodb.use_legacy_protocol.desc')"
                  />
                  <el-select v-model="databaseConfig.use_legacy_protocol">
                    <el-option value="auto" label="auto" />
                    <el-option value="true" label="true" />
                    <el-option value="false" label="false" />
                  </el-select>
                </el-form-item>
              </el-col>
              <template v-if="!isAuthn">
                <el-col :span="12">
                  <el-form-item :label="t('Auth.authzMongoLimit')">
                    <CustomInputNumber v-model="databaseConfig.limit" :min="1" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('Auth.authzMongoSkip')">
                    <CustomInputNumber v-model="databaseConfig.skip" :min="0" />
                  </el-form-item>
                </el-col>
              </template>
            </template>

            <el-col :span="12">
              <el-form-item :label="$t('RuleEngine.connectionPoolSize')">
                <el-input v-model.number="databaseConfig.pool_size" />
              </el-form-item>
            </el-col>
            <el-col v-if="isAuthn && isMySQL" :span="12">
              <el-form-item :label="$t('Auth.queryTimeout')">
                <time-input-with-unit-select v-model="databaseConfig.query_timeout" />
              </el-form-item>
            </el-col>
            <el-col v-if="isMongoDB" :span="12">
              <el-form-item :label="$t('Auth.connectTimeout')">
                <time-input-with-unit-select v-model="databaseConfig.topology.connect_timeout_ms" />
              </el-form-item>
            </el-col>
            <el-col v-if="isPgSQL" :span="12">
              <el-form-item prop="disable_prepared_statements">
                <template #label>
                  <FormItemLabel
                    :label="t('BridgeSchema.common.disable_prepared_statements.label')"
                    :desc="t('BridgeSchema.common.disable_prepared_statements.desc')"
                  />
                </template>
                <el-switch v-model="databaseConfig.disable_prepared_statements" />
              </el-form-item>
            </el-col>
          </el-row>
        </AdvancedSettingContainer>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { PASSWORD_HASH_TYPES_WHICH_NEED_SALT_POSITION } from '@/common/constants'
import { waitAMoment } from '@/common/tools'
import AdvancedSettingContainer from '@/components/AdvancedSettingContainer.vue'
import CustomInputNumber from '@/components/CustomInputNumber.vue'
import FormItemLabel from '@/components/FormItemLabel.vue'
import Monaco from '@/components/Monaco.vue'
import TimeInputWithUnitSelect from '@/components/TimeInputWithUnitSelect.vue'
import CommonTLSConfig from '@/components/TLSConfig/CommonTLSConfig.vue'
import useDatabaseConfig from '@/hooks/Auth/useDatabaseConfig'
import useDatabaseConfigForm from '@/hooks/Auth/useDatabaseConfigForm'
import useI18nTl from '@/hooks/useI18nTl'
import { DatabaseAndServer } from '@/types/auth'
import { MongoType, SaltPosition } from '@/types/enum'
import { ElMessageBox } from 'element-plus'
import { computed, defineComponent, PropType, ref } from 'vue'
import HelpBlock from './HelpBlock.vue'
import PasswordHashAlgorithmFormItems from './PasswordHashAlgorithmFormItems.vue'

export default defineComponent({
  name: 'DatabaseConfig',
  components: {
    CommonTLSConfig,
    TimeInputWithUnitSelect,
    PasswordHashAlgorithmFormItems,
    Monaco,
    HelpBlock,
    CustomInputNumber,
    FormItemLabel,
    AdvancedSettingContainer,
  },

  props: {
    database: {
      required: true,
      type: String as PropType<DatabaseAndServer>,
    },
    modelValue: {
      required: true,
      type: Object,
    },
    authType: {
      required: true,
      type: String as PropType<'authn' | 'authz'>,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const { tl, t } = useI18nTl('Auth')

    const {
      defaultSQL,
      withSaltDefaultSQL,
      databaseConfig,
      defaultContent,
      authnRedisDefaultCMD,
      authnRedisWithSaltDefaultCMD,
    } = useDatabaseConfig(props, ctx)
    const {
      formCom,
      rules,
      isMongoDB,
      isRedis,
      isMySQL,
      isPgSQL,
      isServers,
      validate,
      clearValidate,
    } = useDatabaseConfigForm(props, databaseConfig.value)
    const needHelp = ref(false)
    const isAuthn = computed(() => props.authType === 'authn')

    const setDefaultContent = async (dataKey: string) => {
      await ElMessageBox.confirm(tl('setDefaultConfirm'), {
        confirmButtonText: t('Base.confirm'),
        cancelButtonText: t('Base.cancel'),
        type: 'warning',
      })
      if (isAuthn.value && (isMySQL.value || isPgSQL.value)) {
        databaseConfig.value[dataKey] =
          databaseConfig.value.password_hash_algorithm.salt_position !== SaltPosition.Disable
            ? withSaltDefaultSQL
            : defaultSQL
      } else {
        databaseConfig.value[dataKey] = defaultContent.value
      }
    }

    const btnCopyHelp = ref()
    const toggleNeedHelp = async () => {
      needHelp.value = !needHelp.value
      if (needHelp.value) {
        await waitAMoment(350)
        btnCopyHelp.value?.$el?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const isEnableSalt = computed(() => {
      const { name, salt_position } = databaseConfig.value.password_hash_algorithm
      const needSelectSalt = name && PASSWORD_HASH_TYPES_WHICH_NEED_SALT_POSITION.includes(name)
      return needSelectSalt && salt_position !== SaltPosition.Disable
    })

    const addSaltToQueryOrCMD = () => {
      if ((isMySQL.value || isPgSQL.value) && databaseConfig.value.query === defaultSQL) {
        // enabled salt
        databaseConfig.value.query = withSaltDefaultSQL
      } else if (isRedis.value && databaseConfig.value.cmd === authnRedisDefaultCMD) {
        databaseConfig.value.cmd = authnRedisWithSaltDefaultCMD
      }
    }

    const removeSaltFromQueryOrCMD = () => {
      if ((isMySQL.value || isPgSQL.value) && databaseConfig.value.query === withSaltDefaultSQL) {
        // disabled salt
        databaseConfig.value.query = defaultSQL
      } else if (isRedis.value && databaseConfig.value.cmd === authnRedisWithSaltDefaultCMD) {
        databaseConfig.value.cmd = authnRedisDefaultCMD
      }
    }

    const handleSaltChanged = () => {
      const needsBeHandled = isMySQL.value || isPgSQL.value || isRedis.value
      if (!needsBeHandled) {
        return
      }
      if (isEnableSalt.value) {
        addSaltToQueryOrCMD()
      } else {
        removeSaltFromQueryOrCMD()
      }
    }

    const clearValidateAfterSomeFieldChanged = async () => {
      await waitAMoment(32)
      clearValidate()
    }

    return {
      t,
      formCom,
      rules,
      isMongoDB,
      isRedis,
      isMySQL,
      isPgSQL,
      isServers,
      needHelp,
      databaseConfig,
      isEnableSalt,
      btnCopyHelp,
      MongoType,
      isAuthn,
      clearValidateAfterSomeFieldChanged,
      validate,
      setDefaultContent,
      toggleNeedHelp,
      handleSaltChanged,
    }
  },
})
</script>

<style lang="scss">
@import '../style/authConfig.scss';
</style>
