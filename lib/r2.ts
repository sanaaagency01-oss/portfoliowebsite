import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getCloudflareConfig } from './cloudflare'

export interface R2ClientConfig {
  client: S3Client
  bucket: string
  accountId: string
}

export function getR2Client(): R2ClientConfig | null {
  const config = getCloudflareConfig()
  if (!config || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return null
  }

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  })

  return {
    client,
    bucket: config.r2BucketName || 'baysaass',
    accountId: config.accountId,
  }
}

/**
 * Generates a presigned PUT URL for uploading directly from the browser to Cloudflare R2.
 */
export async function createR2PresignedUploadUrl(
  key: string,
  contentType = 'application/pdf',
  expiresInSeconds = 3600
): Promise<{ uploadUrl: string; key: string } | null> {
  const r2 = getR2Client()
  if (!r2) return null

  try {
    const command = new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(r2.client, command, {
      expiresIn: expiresInSeconds,
    })

    return { uploadUrl, key }
  } catch (e) {
    console.error('[Cloudflare R2 Presigned Upload URL Error]', e)
    return null
  }
}

/**
 * Generates a presigned GET URL for securely downloading a file from Cloudflare R2.
 */
export async function createR2PresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const r2 = getR2Client()
  if (!r2) return null

  try {
    const command = new GetObjectCommand({
      Bucket: r2.bucket,
      Key: key,
    })

    return await getSignedUrl(r2.client, command, {
      expiresIn: expiresInSeconds,
    })
  } catch (e) {
    console.error('[Cloudflare R2 Presigned Download URL Error]', e)
    return null
  }
}

/**
 * Deletes an object from Cloudflare R2.
 */
export async function deleteR2Object(key: string): Promise<boolean> {
  const r2 = getR2Client()
  if (!r2) return false

  try {
    await r2.client.send(
      new DeleteObjectCommand({
        Bucket: r2.bucket,
        Key: key,
      })
    )
    return true
  } catch (e) {
    console.error('[Cloudflare R2 Delete Object Error]', e)
    return false
  }
}
