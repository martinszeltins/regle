import { defineNuxtModule, createResolver, addImportsSources } from '@nuxt/kit';

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'regle',
    configKey: 'regle',
  },
  defaults: {},
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);

    addImportsSources({
      from: '@regle/core',
      imports: ['useRegle', 'createRule', 'defineRegleConfig'] as Array<
        keyof typeof import('@regle/core')
      >,
    });

    addImportsSources({
      from: '@regle/rules',
      imports: ['ruleHelpers', 'withAsync', 'withMessage', 'withParams'] as Array<
        keyof typeof import('@regle/rules')
      >,
    });

    try {
      const regleZod = require('@regle/zod');
      if (regleZod) {
        addImportsSources({
          from: '@regle/zod',
          imports: ['useZodRegle'] as Array<keyof typeof import('@regle/zod')>,
        });
      }
    } catch (e) {
      //
    }
  },
});
