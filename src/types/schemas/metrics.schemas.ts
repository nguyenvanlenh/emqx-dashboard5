export type GetMonitor400Code = typeof GetMonitor400Code[keyof typeof GetMonitor400Code]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetMonitor400Code = {
  BAD_RPC: 'BAD_RPC',
} as const

export type GetMonitor400 = {
  code?: GetMonitor400Code
  message?: string
}

export type GetMonitorParams = {
  latest?: number
}

export type GetMonitorNodesNode404Code =
  typeof GetMonitorNodesNode404Code[keyof typeof GetMonitorNodesNode404Code]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetMonitorNodesNode404Code = {
  NOT_FOUND: 'NOT_FOUND',
} as const

export type GetMonitorNodesNode404 = {
  code?: GetMonitorNodesNode404Code
  message?: string
}

export type GetMonitorNodesNodeParams = {
  latest?: number
}

export type GetMonitorCurrentNodesNode404Code =
  typeof GetMonitorCurrentNodesNode404Code[keyof typeof GetMonitorCurrentNodesNode404Code]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetMonitorCurrentNodesNode404Code = {
  NOT_FOUND: 'NOT_FOUND',
} as const

export type GetMonitorCurrentNodesNode404 = {
  code?: GetMonitorCurrentNodesNode404Code
  message?: string
}

export type GetStats200 = EmqxMgmtApiStatsAggregatedData | EmqxMgmtApiStatsPerNodeData[]

export type GetStatsParams = {
  aggregate?: EmqxMgmtApiStatsAggregateParameter
}

export type GetMetrics200 = EmqxMgmtApiMetricsNodeMetrics[] | EmqxMgmtApiMetricsAggregatedMetrics

export type GetMetricsParams = {
  aggregate?: boolean
  node?: string
}

export type EmqxMgmtApiStatsAggregateParameter = boolean

export interface EmqxMgmtApiStatsPerNodeData {
  node?: string
  'durable_subscriptions.count'?: number
  'channels.count'?: number
  'channels.max'?: number
  'connections.count'?: number
  'connections.max'?: number
  'delayed.count'?: number
  'delayed.max'?: number
  'live_connections.count'?: number
  'live_connections.max'?: number
  'cluster_sessions.count'?: number
  'cluster_sessions.max'?: number
  'retained.count'?: number
  'retained.max'?: number
  'sessions.count'?: number
  'sessions.max'?: number
  'suboptions.count'?: number
  'suboptions.max'?: number
  'subscribers.count'?: number
  'subscribers.max'?: number
  'subscriptions.count'?: number
  'subscriptions.max'?: number
  'subscriptions.shared.count'?: number
  'subscriptions.shared.max'?: number
  'topics.count'?: number
  'topics.max'?: number
}

export interface EmqxMgmtApiStatsAggregatedData {
  'channels.count'?: number
  'channels.max'?: number
  'connections.count'?: number
  'connections.max'?: number
  'delayed.count'?: number
  'delayed.max'?: number
  'live_connections.count'?: number
  'live_connections.max'?: number
  'cluster_sessions.count'?: number
  'cluster_sessions.max'?: number
  'retained.count'?: number
  'retained.max'?: number
  'sessions.count'?: number
  'sessions.max'?: number
  'suboptions.count'?: number
  'suboptions.max'?: number
  'subscribers.count'?: number
  'subscribers.max'?: number
  'subscriptions.count'?: number
  'subscriptions.max'?: number
  'subscriptions.shared.count'?: number
  'subscriptions.shared.max'?: number
  'topics.count'?: number
  'topics.max'?: number
}

export interface EmqxMgmtApiMetricsNodeMetrics {
  node?: string
  'bytes.received'?: number
  'bytes.sent'?: number
  'packets.received'?: number
  'packets.sent'?: number
  'packets.connect.received'?: number
  'packets.connack.sent'?: number
  'packets.connack.error'?: number
  'packets.connack.auth_error'?: number
  'packets.publish.received'?: number
  'packets.publish.sent'?: number
  'packets.publish.inuse'?: number
  'packets.publish.error'?: number
  'packets.publish.auth_error'?: number
  'packets.publish.dropped'?: number
  'packets.puback.received'?: number
  'packets.puback.sent'?: number
  'packets.puback.inuse'?: number
  'packets.puback.missed'?: number
  'packets.pubrec.received'?: number
  'packets.pubrec.sent'?: number
  'packets.pubrec.inuse'?: number
  'packets.pubrec.missed'?: number
  'packets.pubrel.received'?: number
  'packets.pubrel.sent'?: number
  'packets.pubrel.missed'?: number
  'packets.pubcomp.received'?: number
  'packets.pubcomp.sent'?: number
  'packets.pubcomp.inuse'?: number
  'packets.pubcomp.missed'?: number
  'packets.subscribe.received'?: number
  'packets.subscribe.error'?: number
  'packets.subscribe.auth_error'?: number
  'packets.suback.sent'?: number
  'packets.unsubscribe.received'?: number
  'packets.unsubscribe.error'?: number
  'packets.unsuback.sent'?: number
  'packets.pingreq.received'?: number
  'packets.pingresp.sent'?: number
  'packets.disconnect.received'?: number
  'packets.disconnect.sent'?: number
  'packets.auth.received'?: number
  'packets.auth.sent'?: number
  'messages.received'?: number
  'messages.sent'?: number
  'messages.qos0.received'?: number
  'messages.qos0.sent'?: number
  'messages.qos1.received'?: number
  'messages.qos1.sent'?: number
  'messages.qos2.received'?: number
  'messages.qos2.sent'?: number
  'messages.publish'?: number
  'messages.dropped'?: number
  'messages.validation_failed'?: number
  'messages.validation_succeeded'?: number
  'messages.transformation_failed'?: number
  'messages.transformation_succeeded'?: number
  'messages.dropped.await_pubrel_timeout'?: number
  'messages.dropped.no_subscribers'?: number
  'messages.forward'?: number
  'messages.delayed'?: number
  'messages.delivered'?: number
  'messages.acked'?: number
  'messages.persisted'?: number
  'delivery.dropped'?: number
  'delivery.dropped.no_local'?: number
  'delivery.dropped.too_large'?: number
  'delivery.dropped.qos0_msg'?: number
  'delivery.dropped.queue_full'?: number
  'delivery.dropped.expired'?: number
  'client.connect'?: number
  'client.connack'?: number
  'client.connected'?: number
  'client.authenticate'?: number
  'client.auth.anonymous'?: number
  'client.authorize'?: number
  'client.subscribe'?: number
  'client.unsubscribe'?: number
  'client.disconnected'?: number
  'session.created'?: number
  'session.resumed'?: number
  'session.takenover'?: number
  'session.discarded'?: number
  'session.terminated'?: number
  'authorization.allow'?: number
  'authorization.deny'?: number
  'authorization.cache_hit'?: number
  'authorization.cache_miss'?: number
  'authentication.success'?: number
  'authentication.success.anonymous'?: number
  'authentication.failure'?: number
  'overload_protection.delay.ok'?: number
  'overload_protection.delay.timeout'?: number
  'overload_protection.hibernation'?: number
  'overload_protection.gc'?: number
  'overload_protection.new_conn'?: number
}

export interface EmqxMgmtApiMetricsAggregatedMetrics {
  'bytes.received'?: number
  'bytes.sent'?: number
  'packets.received'?: number
  'packets.sent'?: number
  'packets.connect.received'?: number
  'packets.connack.sent'?: number
  'packets.connack.error'?: number
  'packets.connack.auth_error'?: number
  'packets.publish.received'?: number
  'packets.publish.sent'?: number
  'packets.publish.inuse'?: number
  'packets.publish.error'?: number
  'packets.publish.auth_error'?: number
  'packets.publish.dropped'?: number
  'packets.puback.received'?: number
  'packets.puback.sent'?: number
  'packets.puback.inuse'?: number
  'packets.puback.missed'?: number
  'packets.pubrec.received'?: number
  'packets.pubrec.sent'?: number
  'packets.pubrec.inuse'?: number
  'packets.pubrec.missed'?: number
  'packets.pubrel.received'?: number
  'packets.pubrel.sent'?: number
  'packets.pubrel.missed'?: number
  'packets.pubcomp.received'?: number
  'packets.pubcomp.sent'?: number
  'packets.pubcomp.inuse'?: number
  'packets.pubcomp.missed'?: number
  'packets.subscribe.received'?: number
  'packets.subscribe.error'?: number
  'packets.subscribe.auth_error'?: number
  'packets.suback.sent'?: number
  'packets.unsubscribe.received'?: number
  'packets.unsubscribe.error'?: number
  'packets.unsuback.sent'?: number
  'packets.pingreq.received'?: number
  'packets.pingresp.sent'?: number
  'packets.disconnect.received'?: number
  'packets.disconnect.sent'?: number
  'packets.auth.received'?: number
  'packets.auth.sent'?: number
  'messages.received'?: number
  'messages.sent'?: number
  'messages.qos0.received'?: number
  'messages.qos0.sent'?: number
  'messages.qos1.received'?: number
  'messages.qos1.sent'?: number
  'messages.qos2.received'?: number
  'messages.qos2.sent'?: number
  'messages.publish'?: number
  'messages.dropped'?: number
  'messages.validation_failed'?: number
  'messages.validation_succeeded'?: number
  'messages.transformation_failed'?: number
  'messages.transformation_succeeded'?: number
  'messages.dropped.await_pubrel_timeout'?: number
  'messages.dropped.no_subscribers'?: number
  'messages.forward'?: number
  'messages.delayed'?: number
  'messages.delivered'?: number
  'messages.acked'?: number
  'messages.persisted'?: number
  'delivery.dropped'?: number
  'delivery.dropped.no_local'?: number
  'delivery.dropped.too_large'?: number
  'delivery.dropped.qos0_msg'?: number
  'delivery.dropped.queue_full'?: number
  'delivery.dropped.expired'?: number
  'client.connect'?: number
  'client.connack'?: number
  'client.connected'?: number
  'client.authenticate'?: number
  'client.auth.anonymous'?: number
  'client.authorize'?: number
  'client.subscribe'?: number
  'client.unsubscribe'?: number
  'client.disconnected'?: number
  'session.created'?: number
  'session.resumed'?: number
  'session.takenover'?: number
  'session.discarded'?: number
  'session.terminated'?: number
  'authorization.allow'?: number
  'authorization.deny'?: number
  'authorization.cache_hit'?: number
  'authorization.cache_miss'?: number
  'authentication.success'?: number
  'authentication.success.anonymous'?: number
  'authentication.failure'?: number
  'overload_protection.delay.ok'?: number
  'overload_protection.delay.timeout'?: number
  'overload_protection.hibernation'?: number
  'overload_protection.gc'?: number
  'overload_protection.new_conn'?: number
}

export interface EmqxDashboardMonitorApiSamplerCurrentNode {
  connections?: number
  disconnected_durable_sessions?: number
  dropped_msg_rate?: number
  live_connections?: number
  node_uptime?: number
  persisted_rate?: number
  received_msg_rate?: number
  retained_msg_count?: number
  sent_msg_rate?: number
  shared_subscriptions?: number
  subscriptions?: number
  subscriptions_durable?: number
  topics?: number
  transformation_failed_rate?: number
  transformation_succeeded_rate?: number
  validation_failed_rate?: number
  validation_succeeded_rate?: number
}

export interface EmqxDashboardMonitorApiSamplerCurrent {
  connections?: number
  disconnected_durable_sessions?: number
  dropped_msg_rate?: number
  live_connections?: number
  persisted_rate?: number
  received_msg_rate?: number
  retained_msg_count?: number
  sent_msg_rate?: number
  shared_subscriptions?: number
  subscriptions?: number
  subscriptions_durable?: number
  topics?: number
  transformation_failed_rate?: number
  transformation_succeeded_rate?: number
  validation_failed_rate?: number
  validation_succeeded_rate?: number
}

export interface EmqxDashboardMonitorApiSampler {
  time_stamp?: number
  disconnected_durable_sessions?: number
  subscriptions_durable?: number
  subscriptions?: number
  topics?: number
  connections?: number
  live_connections?: number
  received?: number
  sent?: number
  validation_succeeded?: number
  validation_failed?: number
  transformation_succeeded?: number
  transformation_failed?: number
  dropped?: number
  persisted?: number
}
