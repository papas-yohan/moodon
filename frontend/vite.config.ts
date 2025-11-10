import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '신상마켓 - 상품 홍보 시스템',
        short_name: '신상마켓',
        description: 'AI 이미지 합성 기반 상품 마케팅 자동화 플랫폼',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24시간
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30일
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // 프로덕션에서는 소스맵 비활성화
    sourcemap: process.env.NODE_ENV !== 'production',
    // 청크 크기 최적화
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 벤더 라이브러리를 더 세분화하여 분리
          if (id.includes('node_modules')) {
            // React 관련
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // 라우팅 및 상태 관리
            if (id.includes('react-router') || id.includes('@tanstack/react-query')) {
              return 'routing-vendor';
            }
            // AG Grid (가장 큰 라이브러리)
            if (id.includes('ag-grid')) {
              return 'ag-grid-vendor';
            }
            // 차트 라이브러리
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            // 아이콘 및 UI
            if (id.includes('lucide-react') || id.includes('react-hook-form')) {
              return 'ui-vendor';
            }
            // 기타 벤더
            return 'vendor';
          }
          
          // 페이지별 청크 분리
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
          
          // 컴포넌트별 청크 분리 (큰 컴포넌트만)
          if (id.includes('/components/products/') || id.includes('/components/contacts/')) {
            return 'components-heavy';
          }
        },
      },
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  // 개발 서버 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      'recharts',
      'ag-grid-react',
      'ag-grid-community',
      'lucide-react',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})