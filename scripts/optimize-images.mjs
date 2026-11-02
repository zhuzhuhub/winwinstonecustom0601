
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputRoot = path.resolve("public/images");
const outputRoot = path.resolve("image-optimization-output-webp");
const reportPath = path.resolve("image-optimization-report.csv");

const supported = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const report = [["file", "before_bytes", "after_bytes", "saved_percent"]];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

  // 本次只处理 WebP 图片
    if (ext !== ".webp") continue;

    if (!supported.has(ext)) continue;

    const relative = path.relative(inputRoot, fullPath);
    const outputPath = path.join(outputRoot, relative);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const before = (await fs.stat(fullPath)).size;
    const image = sharp(fullPath, { failOn: "error" });
    const metadata = await image.metadata();

    let pipeline = image.rotate();

    if (
      (metadata.width ?? 0) > 2000 ||
      (metadata.height ?? 0) > 2000
    ) {
      pipeline = pipeline.resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (ext === ".png") {
      await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
    } else if (ext === ".webp") {
      await pipeline.webp({ quality: 85, effort: 4 }).toFile(outputPath);
    } else {
      await pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(outputPath);
  }

    const after = (await fs.stat(outputPath)).size;
    const saved = before > 0
      ? ((before - after) / before * 100).toFixed(1)
      : "0.0";

    report.push([relative, String(before), String(after), saved]);

    console.log(`${relative}: ${before} -> ${after} bytes (${saved}%)`);
  }
}

await fs.mkdir(outputRoot, { recursive: true });
await walk(inputRoot);

const csv = report
  .map(row => row.map(value =>
    `"${value.replaceAll('"', '""')}"`
  ).join(","))
  .join("\n");

await fs.writeFile(reportPath, csv, "utf8");

console.log(`\nFinished. Output: ${outputRoot}`);
console.log(`Report: ${reportPath}`);
