import { getCollection } from 'astro:content';
import { promises as fs } from 'fs';
import path from 'path';

const SITE = (import.meta.env.SITE as string) || 'https://winwinstonecustom.com';

async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip directories starting with _ or containing dynamic segments
      if (entry.name.startsWith('_') || entry.name.startsWith('[')) continue;
      files.push(...await walkDir(full));
    } else if (entry.isFile()) {
      if (entry.name === 'sitemap.xml.ts') continue;
      if (!/\.astro$/.test(entry.name)) continue;
      if (entry.name.startsWith('_') || entry.name.startsWith('[')) continue;
      files.push(full);
    }
  }

  return files;
}

function fileToRoute(pagesDir: string, filePath: string) {
  let rel = path.relative(pagesDir, filePath).replace(/\\/g, '/');
  rel = rel.replace(/\.astro$/, '');
  if (rel.endsWith('/index')) rel = rel.replace(/index$/, '');
  if (!rel.startsWith('/')) rel = '/' + rel;
  if (!rel.endsWith('/')) rel = rel + '/';
  return rel;
}

export async function GET() {
  // Use project cwd to locate source pages directory (works during build/prerender)
  const pagesDir = path.join(process.cwd(), 'src', 'pages');

  // gather static pages
  let staticRoutes: string[] = [];
  try {
    const files = await walkDir(pagesDir);
    staticRoutes = files.map(f => fileToRoute(pagesDir, f));
  } catch (e) {
    // ignore and continue with content-driven routes
    console.error('sitemap: failed to read pages dir', e);
  }

  // gather content-driven product pages
  const products = await getCollection('products');
  // p.slug already contains category (e.g., "stone-sinks/product-name")
  const productRoutes = products.map(p => {
    return `/${p.slug}/`;
  });

  // gather blog pages if any
  let blogRoutes: string[] = [];
  try {
    const blog = await getCollection('blog');
    blogRoutes = blog.map(b => `/blog/${b.slug}/`);
  } catch (e) {
    // no blog collection or empty
  }

  // merge and dedupe
  const routes = Array.from(new Set([
    ...staticRoutes,
    ...productRoutes,
    ...blogRoutes,
  ]));

  const urls = routes
    .filter(r => !r.includes('[')) // skip dynamic placeholders
    .map(r => `  <url>\n    <loc>${SITE.replace(/\/$/, '')}${r}</loc>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
}
