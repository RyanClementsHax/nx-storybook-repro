import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/app/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  staticDirs: ['../src/public'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: undefined,
      },
    },
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');
    const { default: angular } = await import('@analogjs/vite-plugin-angular');

    /**
     * Replace imports of "@storybook/angular" with "@storybook/angular/dist/client"
     */
    const storybookAngularImportPlugin = () => ({
      name: '@storybook/angular',
      config() {
        return {
          build: {
            minify: false,
            rollupOptions: {
              plugins: [
                {
                  name: 'disable-compiler-treeshake',
                  transform(_code: string, id: string) {
                    if (id.includes('compiler')) {
                      console.log('compiler.mjs', id);
                      return { moduleSideEffects: 'no-treeshake' };
                    }

                    return;
                  },
                },
              ],
            },
          },
        };
      },
      transform(code: string) {
        if (code.includes('"@storybook/angular"')) {
          return code.replace(
            /\"@storybook\/angular\"/g,
            '"@storybook/angular/dist/client"',
          );
        }

        return;
      },
    });

    return mergeConfig(config, {
      // Add dependencies to pre-optimization
      plugins: [
        angular({ jit: true, tsconfig: './.storybook/tsconfig.json' }),
        storybookAngularImportPlugin(),
      ],
    });
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
