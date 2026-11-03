import { build } from 'esbuild';
await build({ entryPoints: ['src/auth-client.js'], outfile: 'public/auth-client.js', bundle: true, format: 'esm', platform: 'browser', minify: true, sourcemap: false, target: ['es2022'] });
