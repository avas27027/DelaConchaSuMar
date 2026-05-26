// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  server: {
    host: true,
    port: Number(process.env.PORT) || 3000,
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [react()],
});