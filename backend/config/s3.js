import { S3Client } from '@aws-sdk/client-s3'

let s3Client

export const initS3Client = () => {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export const getS3Client = () => {
  if (!s3Client) {
    throw new Error('S3 client not initialized.')
  }
  return s3Client
}
