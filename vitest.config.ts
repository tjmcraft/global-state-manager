import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup/vitest.setup.ts'],
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    clearMocks: true,
  },
});
