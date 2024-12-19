/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let serverConfig = {};

  if (command === 'serve') {
    if (!env.VITE_CLIENT_URL) {
      throw new Error(
        'VITE_CLIENT_URL environment variable is required for the ui vite server to run',
      );
    }

    const PORT = Number(new URL(env.VITE_CLIENT_URL).port);

    serverConfig = {
      server: {
        port: PORT,
        host: 'localhost',
      },
      preview: {
        port: PORT,
        host: 'localhost',
      },
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/ui',
    ...serverConfig,
    plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: '../../dist/packages/ui',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
