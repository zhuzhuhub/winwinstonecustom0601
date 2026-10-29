
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputRoot = path.resolve("image-to-optimize");
const outputRoot = path.resolve("image-optimization-preview");
const reportPath = path.resolve("image-optimization-report.csv");

const supported = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const report = [["file", "format", "before_bytes", "after_bytes", "saved_percent", "status"]];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!supported.has(ext)) continue;

    const relative = path.relative(inputRoot, fullPath);
    const outputPath = path.join(outputRoot, relative);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const before = (await fs.stat(fullPath)).size;

    try {
    const image = sharp(fullPath, { failOn: "error" });
    const metadata = await image.metadata();

   let pipeline = image.rotate();

   if ((metadata.width ?? 0) > 2000 || (metadata.height ?? 0) > 2000) {
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

   let after = (await fs.stat(outputPath)).size;
   let status = "OK";

   if (after >= before) {
    await fs.copyFile(fullPath, outputPath);
    after = before;
    status = "KEPT_ORIGINAL";
  }

   const saved = before > 0
    ? ((before - after) / before * 100).toFixed(1)
    : "0.0";

   report.push([
    relative,
    ext.slice(1),
    String(before),
    String(after),
    saved,
    status,
  ]);

   console.log(
    `${relative}: ${before} -> ${after} bytes (${saved}% saved; ${status})`
    );
    } catch (error) {
      report.push([
        relative,
        ext.slice(1),
        String(before),
        "",
        "",
        `ERROR: ${error.message}`,
      ]);

      console.error(`处理失败：${relative}`);
      console.error(error.message);
    }
  }
}

await fs.mkdir(inputRoot, { recursive: true });

// 每次运行前清理旧预览，避免遗留过期图片
await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });

const files = await fs.readdir(inputRoot);

if (files.length === 0) {
  console.log("待处理文件夹为空，请先放入图片。");
  process.exitCode = 1;
} else {
  await walk(inputRoot);

  const csv = report
    .map(row => row.map(value =>
      `"${String(value).replaceAll('"', '""')}"`
    ).join(","))
    .join("\n");

  await fs.writeFile(reportPath, csv, "utf8");

  console.log("\n处理完成。");
  console.log(`压缩图片：${outputRoot}`);
  console.log(`检查报告：${reportPath}`);
}
