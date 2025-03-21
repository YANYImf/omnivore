/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv'
import os from 'os'

interface BackendEnv {
  pg: {
    host: string
    port: number
    userName: string
    password: string
    dbName: string
    pool: {
      max: number
    }
  }
  server: {
    jwtSecret: string
    ssoJwtSecret: string
    gateway_url: string
    apiEnv: string
    instanceId: string
    trustProxy: boolean
  }
  client: {
    url: string
    previewGenerationServiceUrl: string
    previewImageWrapperId: string
  }
  google: {
    auth: {
      iosClientId: string
      androidClientId: string
      clientId: string
      secret: string
    }
  }
  segment: {
    writeKey: string
  }
  intercom: {
    token: string
    secretKey: string
  }
  sentry: {
    dsn: string
  }
  jaeger: {
    host: string
  }
  imageProxy: {
    url: string
    secretKey: string
  }
  twitter: {
    token: string
  }
  dev: {
    isLocal: boolean
  }
  queue: {
    location: string
    name: string
    contentFetchUrl: string
    contentFetchGCFUrl: string
    reminderTaskHandlerUrl: string
    integrationTaskHandlerUrl: string
    textToSpeechTaskHandlerUrl: string
    recommendationTaskHandlerUrl: string
    thumbnailTaskHandlerUrl: string
    rssFeedTaskHandlerUrl: string
    integrationExporterUrl: string
    integrationImporterUrl: string
  }
  fileUpload: {
    gcsUploadBucket: string
    gcsUploadSAKeyFilePath: string
    gcsUploadPrivateBucket: string
  }
  sender: {
    message: string
    feedback: string
    general: string
  }
  sendgrid: {
    confirmationTemplateId: string
    reminderTemplateId: string
    resetPasswordTemplateId: string
    installationTemplateId: string
    verificationTemplateId: string
  }
  readwise: {
    apiUrl: string
  }
  azure: {
    speechKey: string
    speechRegion: string
  }
  gcp: {
    location: string
  }

  pocket: {
    consumerKey: string
  }
}

/***
 * Checks if we are running on Google App Engine.
 * See https://cloud.google.com/appengine/docs/standard/nodejs/runtime#environment_variables
 */
export function isAppEngine(): boolean {
  return (
    process.env.GOOGLE_CLOUD_PROJECT !== undefined &&
    process.env.GAE_INSTANCE !== undefined &&
    process.env.GAE_SERVICE !== undefined &&
    process.env.GAE_VERSION !== undefined
  )
}

const nullableEnvVars = [
  'INTERCOM_TOKEN',
  'INTERCOM_SECRET_KEY',
  'GAE_INSTANCE',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'JAEGER_HOST',
  'IMAGE_PROXY_URL',
  'IMAGE_PROXY_SECRET',
  'SAMPLE_METRICS_LOCALLY',
  'PUPPETEER_QUEUE_LOCATION',
  'PUPPETEER_QUEUE_NAME',
  'CONTENT_FETCH_URL',
  'CONTENT_FETCH_GCF_URL',
  'PREVIEW_IMAGE_WRAPPER_ID',
  'PREVIEW_GENERATION_SERVICE_URL',
  'GCS_UPLOAD_SA_KEY_FILE_PATH',
  'GAUTH_IOS_CLIENT_ID',
  'GAUTH_ANDROID_CLIENT_ID',
  'GAUTH_CLIENT_ID',
  'GAUTH_SECRET',
  'SEGMENT_WRITE_KEY',
  'TWITTER_BEARER_TOKEN',
  'GCS_UPLOAD_PRIVATE_BUCKET',
  'SENDER_MESSAGE',
  'SENDER_FEEDBACK',
  'SENDER_GENERAL',
  'SENDGRID_CONFIRMATION_TEMPLATE_ID',
  'SENDGRID_REMINDER_TEMPLATE_ID',
  'SENDGRID_RESET_PASSWORD_TEMPLATE_ID',
  'SENDGRID_INSTALLATION_TEMPLATE_ID',
  'READWISE_API_URL',
  'INTEGRATION_TASK_HANDLER_URL',
  'TEXT_TO_SPEECH_TASK_HANDLER_URL',
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'GCP_LOCATION',
  'RECOMMENDATION_TASK_HANDLER_URL',
  'POCKET_CONSUMER_KEY',
  'THUMBNAIL_TASK_HANDLER_URL',
  'RSS_FEED_TASK_HANDLER_URL',
  'SENDGRID_VERIFICATION_TEMPLATE_ID',
  'REMINDER_TASK_HANDLER_URL',
  'TRUST_PROXY',
  'INTEGRATION_EXPORTER_URL',
  'INTEGRATION_IMPORTER_URL',
] // Allow some vars to be null/empty

/* If not in GAE and Prod/QA/Demo env (f.e. on localhost/dev env), allow following env vars to be null */
if (
  !isAppEngine() &&
  ['prod', 'qa', 'demo'].indexOf(process.env.API_ENV || '') === -1
) {
  nullableEnvVars.push(
    ...['GCS_UPLOAD_BUCKET', 'PREVIEW_GENERATION_SERVICE_URL']
  )
}

const envParser =
  (env: { [key: string]: string | undefined }) =>
  (varName: string): string => {
    const value = env[varName]
    if (typeof value === 'string' && value) {
      return value
    } else if (nullableEnvVars.includes(varName)) {
      return ''
    }
    throw new Error(
      `Missing ${varName} with a non-empty value in process environment`
    )
  }

export function getEnv(): BackendEnv {
  // Dotenv parses env file merging into proces.env which is then read into custom struct here.
  dotenv.config()

  const parse = envParser(process.env)
  const pg = {
    host: parse('PG_HOST'),
    port: parseInt(parse('PG_PORT'), 10),
    userName: parse('PG_USER'),
    password: parse('PG_PASSWORD'),
    dbName: parse('PG_DB'),
    pool: {
      max: parseInt(parse('PG_POOL_MAX'), 10),
    },
  }
  const server = {
    jwtSecret: parse('JWT_SECRET'),
    ssoJwtSecret: parse('SSO_JWT_SECRET'),
    gateway_url: parse('GATEWAY_URL'),
    apiEnv: parse('API_ENV'),
    instanceId:
      parse('GAE_INSTANCE') || `x${os.userInfo().username}_${os.hostname()}`,
    trustProxy: parse('TRUST_PROXY') === 'true',
  }
  const client = {
    url: parse('CLIENT_URL'),
    previewGenerationServiceUrl: parse('PREVIEW_GENERATION_SERVICE_URL'),
    previewImageWrapperId: parse('PREVIEW_IMAGE_WRAPPER_ID'),
  }
  const google = {
    auth: {
      iosClientId: parse('GAUTH_IOS_CLIENT_ID'),
      androidClientId: parse('GAUTH_ANDROID_CLIENT_ID'),
      clientId: parse('GAUTH_CLIENT_ID'),
      secret: parse('GAUTH_SECRET'),
    },
  }
  const segment = {
    writeKey: parse('SEGMENT_WRITE_KEY'),
  }
  const intercom = {
    token: parse('INTERCOM_TOKEN'),
    secretKey: parse('INTERCOM_SECRET_KEY'),
  }
  const sentry = {
    dsn: parse('SENTRY_DSN'),
  }
  const jaeger = {
    host: parse('JAEGER_HOST'),
  }
  const dev = {
    isLocal: !isAppEngine(),
  }
  const queue = {
    location: parse('PUPPETEER_QUEUE_LOCATION'),
    name: parse('PUPPETEER_QUEUE_NAME'),
    contentFetchUrl: parse('CONTENT_FETCH_URL'),
    contentFetchGCFUrl: parse('CONTENT_FETCH_GCF_URL'),
    reminderTaskHandlerUrl: parse('REMINDER_TASK_HANDLER_URL'),
    integrationTaskHandlerUrl: parse('INTEGRATION_TASK_HANDLER_URL'),
    textToSpeechTaskHandlerUrl: parse('TEXT_TO_SPEECH_TASK_HANDLER_URL'),
    recommendationTaskHandlerUrl: parse('RECOMMENDATION_TASK_HANDLER_URL'),
    thumbnailTaskHandlerUrl: parse('THUMBNAIL_TASK_HANDLER_URL'),
    rssFeedTaskHandlerUrl: parse('RSS_FEED_TASK_HANDLER_URL'),
    integrationExporterUrl: parse('INTEGRATION_EXPORTER_URL'),
    integrationImporterUrl: parse('INTEGRATION_IMPORTER_URL'),
  }
  const imageProxy = {
    url: parse('IMAGE_PROXY_URL'),
    secretKey: parse('IMAGE_PROXY_SECRET'),
  }
  const twitter = {
    token: parse('TWITTER_BEARER_TOKEN'),
  }
  const fileUpload = {
    gcsUploadBucket: parse('GCS_UPLOAD_BUCKET'),
    gcsUploadSAKeyFilePath: parse('GCS_UPLOAD_SA_KEY_FILE_PATH'),
    gcsUploadPrivateBucket: parse('GCS_UPLOAD_PRIVATE_BUCKET'),
  }
  const sender = {
    message: parse('SENDER_MESSAGE'),
    feedback: parse('SENDER_FEEDBACK'),
    general: parse('SENDER_GENERAL'),
  }

  const sendgrid = {
    confirmationTemplateId: parse('SENDGRID_CONFIRMATION_TEMPLATE_ID'),
    reminderTemplateId: parse('SENDGRID_REMINDER_TEMPLATE_ID'),
    resetPasswordTemplateId: parse('SENDGRID_RESET_PASSWORD_TEMPLATE_ID'),
    installationTemplateId: parse('SENDGRID_INSTALLATION_TEMPLATE_ID'),
    verificationTemplateId: parse('SENDGRID_VERIFICATION_TEMPLATE_ID'),
  }

  const readwise = {
    apiUrl: parse('READWISE_API_URL'),
  }

  const azure = {
    speechKey: parse('AZURE_SPEECH_KEY'),
    speechRegion: parse('AZURE_SPEECH_REGION'),
  }

  const gcp = {
    location: parse('GCP_LOCATION'),
  }

  const pocket = {
    consumerKey: parse('POCKET_CONSUMER_KEY'),
  }

  return {
    pg,
    client,
    server,
    google,
    segment,
    intercom,
    sentry,
    jaeger,
    imageProxy,
    twitter,
    dev,
    fileUpload,
    queue,
    sender,
    sendgrid,
    readwise,
    azure,
    gcp,
    pocket,
  }
}

export type Merge<
  Target extends Record<string, any>,
  Part extends Record<string, any>
> = Omit<Target, keyof Part> & Part

/**
 * Make all properties in T optional
 * This is similar to TS's Partial type, but it also allows null
 */
export type Partialize<T> = {
  [P in keyof T]?: T[P] | null
}

export function exclude<A extends readonly any[], B extends readonly any[]>(
  a: A,
  b: B
): readonly Exclude<A[number], B[number]>[] {
  return a.filter((x) => b.includes(x)) as any
}

export type PickTuple<A, B extends readonly any[]> = Pick<A, B[number]>
