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
};
if (process.argv.includes('--watch')) {
  const buildContext = await context(options);
  await buildContext.watch();
} else {
  await build(options);
}
