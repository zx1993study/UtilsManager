import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'copy-images',
          closeBundle: async () => {
            const fs = await import('fs/promises');
            const path = await import('path');

            try {
              // 确保目标目录存在
              await fs.mkdir('dist/images', { recursive: true });

              // 复制 images 文件夹中的所有内容到 dist/images
              const files = await fs.readdir('./images');
              for (const file of files) {
                const srcPath = path.join('./images', file);
                const destPath = path.join('dist/images', file);

                // 检查是文件还是目录
                const stat = await fs.stat(srcPath);
                if (stat.isFile()) {
                  // 如果是文件，直接复制
                  await fs.copyFile(srcPath, destPath);
                } else if (stat.isDirectory()) {
                  // 如果是目录，递归复制
                  await copyDir(srcPath, destPath);
                }
              }

              console.log('成功复制 images 文件夹到 dist 目录');
            } catch (error) {
              console.error('复制 images 文件夹到 dist 目录时出错:', error);
            }
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

// 递归复制目录的辅助函数
async function copyDir(src, dest) {
  const fs = await import('fs/promises');
  const path = await import('path');

  // 创建目标目录
  await fs.mkdir(dest, { recursive: true });

  // 读取源目录中的所有条目
  const entries = await fs.readdir(src, { withFileTypes: true });

  // 复制每个条目
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 如果是目录，递归复制
      await copyDir(srcPath, destPath);
    } else {
      // 如果是文件，直接复制
      await fs.copyFile(srcPath, destPath);
    }
  }
}
