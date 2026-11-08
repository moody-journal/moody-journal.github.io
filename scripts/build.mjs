import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build, context } from 'esbuild';
const options = {
  entryPoints: ['src/experience.tsx'],
  bundle: true,
  outfile: 'assets/js/experience.js',
  minify: true,
  format: 'esm',
  target: ['es2022'],
  jsx: 'automatic',
  legalComments: 'eof',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
  plugins: [{ name: 'asset-revisions', setup(builder) {
    builder.onEnd(async result => {
      if (result.errors.length) return;
      const assets = ['assets/js/experience.js', 'assets/js/experience.css', 'assets/css/marketing.css', 'assets/css/reading.css'];
      const revisions = await Promise.all(assets.map(async asset => [asset, createHash('sha256').update(await readFile(asset)).digest('hex').slice(0, 10)]));
      for (const page of ['index.html', 'privacy.html', 'support.html']) {
        const original = await readFile(page, 'utf8');
        let next = original;
        for (const [asset, hash] of revisions) {
          const escaped = asset.replaceAll('.', '\\.');
          next = next.replace(new RegExp(escaped + '(?:\\?v=[^" ]*)?(?=")', 'g'), asset + '?v=' + hash);
        }
        if (next !== original) await writeFile(page, next);
      }
    });
  } }],
};
if (process.argv.includes('--watch')) {
  const buildContext = await context(options);
  await buildContext.watch();
} else {
  await build(options);
}
