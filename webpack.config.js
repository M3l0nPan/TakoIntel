import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { sync as globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getScriptsEntryPoints() {
  const tsFiles = globSync('./src/scripts/**/*.ts');
  return tsFiles.reduce((entries, file) => {
    const entryName = file.replace('src/scripts/', '').replace('.ts', '');
    entries[entryName] = './' + file;
    return entries;
  }, {});
}

export default (env = {}) => {
  const buildTarget = env.BUILD_TARGET || 'chrome';

  return {
    entry: {
      ...getScriptsEntryPoints(),
      background: './src/background.ts',
      content: './src/content.ts'
    },
    output: {
      filename: (pathData) => {
        if (pathData.chunk.name === 'background' || pathData.chunk.name === 'content') {
          return '[name].js';
        }
        return 'scripts/[name].js';
      },
      path: `${__dirname}/dist`,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        }
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: `src/manifest_${buildTarget}.json`, to: 'manifest.json'},
          { from: 'src/modules', to: 'modules' },
          { from: 'src/assets', to: 'assets' },
          { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'browser-polyfill.js' }
        ],
      })
    ]
  }
};
