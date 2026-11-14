import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['tests/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: ['js/billing.js', 'js/plate.js', 'js/store.js', 'js/utils.js'],
            reporter: ['text'],
        },
    },
});
