import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://sssclash.com.cn',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (url) => !/\/(search|404)\/?$/.test(url) })],
  devToolbar: { enabled: false },
});
