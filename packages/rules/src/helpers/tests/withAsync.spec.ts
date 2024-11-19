import type { RegleRuleDefinition } from '@regle/core';
import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { withAsync } from '../withAsync';
import { withMessage } from '../withMessage';

describe('withAsync helper', () => {
  const mountComponent = () => {
    return mount(
      defineComponent({
        setup() {
          const form = ref({
            email: '',
            count: 0,
          });

          const { errors, validateState, regle } = useRegle(form, () => ({
            email: {
              error: withMessage(
                withAsync(
                  async (value) => {
                    await timeout(1000);
                    return form.value.count === 0;
                  },
                  [() => form.value.count]
                ),
                'Error'
              ),
            },
          }));

          return { form, errors, validateState, regle };
        },
        template: '<div>{{regle}}</div>',
      })
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return empty errors', () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.errors.email).toStrictEqual([]);
  });

  it('should be on pending state when changing value', async () => {
    const wrapper = mountComponent();
    wrapper.vm.form.email = 'f';

    await nextTick();

    expect(wrapper.vm.regle.$pending).toBe(true);
    expect(wrapper.vm.regle.$fields.email.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(wrapper.vm.regle.$pending).toBe(false);
    expect(wrapper.vm.regle.$fields.email.$pending).toBe(false);
    expect(wrapper.vm.regle.$fields.email.$error).toBe(false);
  });

  it.only('should be on pending state and validate when changing dep', async () => {
    const wrapper = mountComponent();
    wrapper.vm.form.email = 'f';
    wrapper.vm.form.count = 1;

    await vi.advanceTimersByTimeAsync(100);
    await nextTick();

    expect(wrapper.vm.regle.$pending).toBe(true);
    expect(wrapper.vm.regle.$fields.email.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(wrapper.vm.regle.$pending).toBe(false);
    expect(wrapper.vm.regle.$fields.email.$pending).toBe(false);

    expect(wrapper.vm.regle.$fields.email.$rules.error.$valid).toBe(false);
    expect(wrapper.vm.regle.$fields.email.$error).toBe(true);
    expect(wrapper.vm.errors.email).toStrictEqual(['Error']);
  });

  it('should handle failed promises', async () => {
    const rule = withAsync(async () => {
      try {
        return await new Promise<boolean>((resolve, reject) => {
          reject(false);
        });
      } catch (e) {
        return false;
      }
    });

    expect(await rule.exec(null)).toBe(false);
  });

  it('should have correct types', () => {
    expectTypeOf(
      withAsync(
        async (value) => {
          return true;
        },
        [() => 0]
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [number], true, boolean, unknown>>();

    expectTypeOf(
      withAsync(async (value) => {
        return true;
      })
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();
  });
});
