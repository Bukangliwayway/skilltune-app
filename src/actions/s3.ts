import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

interface GetUploadParams {
  filename: string;
  contentType: string;
}

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function getUploadParams({ contentType }: GetUploadParams) {
  try {
    const key = uuidv4();

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: key,
      Conditions: [
        ["content-length-range", 0, 524288000], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 3600,
    });

    return { url, fields };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error" };
  }
}

export async function getDownloadUrl(key: string) {
  try {
    // First, get the object metadata to retrieve the size
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: key,
    });

    const headResponse = await s3Client.send(headCommand);
    const size = headResponse.ContentLength; // This is the file size in bytes

    // Now, generate the download URL
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: key,
    });

    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });

    return { url, size };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return { error: "Failed to generate download URL" };
  }
}

// Thumbnails are pretty small, so we dont need to track bandwidth usage
export async function getThumbnailDownloadUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_THUMBNAIL_BUCKET_NAME ?? "",
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url };
  } catch (error) {
    return { error: "Failed to generate thumbnail download URL" };
  }
}

export async function checkS3ObjectExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME ?? "",
        Key: key,
      })
    );
    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteFile(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: key,
    });

    await s3Client.send(command);

    console.log("nagrun naman baii");

    return { success: true };
  } catch (error) {
    return { error: "Failed to delete file from S3 Bucket" };
  }
}
