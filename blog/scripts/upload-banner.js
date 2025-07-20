"use strict";
// upload.js
// Usage: node upload.js <dir> <bucket> <endpoint> <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY>

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";
import { globby } from "globby";

const [DIR, BUCKET, ENDPOINT, ACCESS_KEY, SECRET_KEY] = process.argv.slice(2);
if (!DIR || !BUCKET || !ENDPOINT) {
  console.error("Usage: node upload.js <directory> <bucket> <endpoint> <accessKey?> <secretKey?>");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const imageExt = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
      ".webp": "image/webp",
    }[ext] ?? "application/octet-stream"
  );
}

async function getMeta(src) {
  const buffer = await fs.readFile(src);
  const {
    base64,
    metadata: { width, height, orientation },
  } = await getPlaiceholder(buffer);
  return { width, height, base64, buffer, orientation };
}

async function alreadyUploaded(key) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    const meta = head.Metadata ?? {};
    return meta.width && meta.height && meta.blur;
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404 || err.name === "NotFound") {
      return false; // object does not exist
    }
    // Any other error: rethrow so caller is aware
    throw err;
  }
}

async function uploadImage(absPath) {
  const relKey = "banner/" + path.relative(DIR, absPath).replace(/\\/g, "/");
  if (await alreadyUploaded(relKey)) {
    console.log("⚠️  skip (already has metadata)", relKey);
    return;
  }
  try {
    const { width, height, base64, buffer, orientation } = await getMeta(absPath);

    console.log(absPath, width, height, orientation);
    // https://kingsubin.com/551
    const metadata = {
      width: orientation && orientation >= 5 ? String(height) : String(width),
      height: orientation && orientation >= 5 ? String(width) : String(height),
      blur: base64,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `banner/${relKey}`,
        Body: buffer,
        ContentType: contentType(absPath),
        Metadata: metadata,
      }),
    );
    console.log("✅", relKey);
  } catch (e) {
    console.error("❌", relKey, e);
  }
}

(async () => {
  const patterns = imageExt.map((e) => `**/*${e}`);
  const files = await globby(patterns, { cwd: DIR, caseSensitiveMatch: false });
  for (const rel of files) {
    const abs = path.join(DIR, rel);
    await uploadImage(abs);
  }
})();
