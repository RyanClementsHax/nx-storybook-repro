import { defineEventHandler, handleCors } from 'h3';

const frontendUrls = 'testing';
if (typeof frontendUrls !== 'string') {
  throw new Error('FRONTEND_URLS environment variable is not set');
}

export default defineEventHandler((event) => {
  handleCors(event, {
    methods: '*',
    allowHeaders: '*',
    origin: frontendUrls.split(',').map((url) => url.trim()),
  });
});
