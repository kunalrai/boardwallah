// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_ORIGIN || process.env.SITE_ORIGIN || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  output: 'static',
});
