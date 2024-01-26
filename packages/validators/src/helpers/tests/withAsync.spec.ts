import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { withAsync } from '../../helpers/withAsync';
import { withMessage } from '../../helpers/withMessage';

describe('withAsync helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        count: 0,
      });

      const { $errors, validateForm, $regle } = useRegle(form, () => ({
        email: {
          error: withMessage(
            withAsync(
              async (value) => {
                await timeout(10000);
                return form.value.count === 0;
              },
              [() => form.value.count]
            ),
            'Error'
          ),
        },
      }));

      return { form, $errors, validateForm, $regle };
    },
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const { vm } = mount(testComponent);

  it('should return empty errors', () => {
    expect(vm.$errors.email).toStrictEqual([]);
  });

  it('should be on pending state when changing value', async () => {
    vi.useFakeTimers();
    vm.form.email = 'f';
    await timeout(0);
    expect(vm.$regle.$pending).toBe(true);
    expect(vm.$regle.$fields.email.$pending).toBe(true);

    vi.runAllTimers();
    await flushPromises();
    expect(vm.$regle.$pending).toBe(false);
    expect(vm.$regle.$fields.email.$pending).toBe(false);

    expect(vm.$regle.$fields.email.$error).toBe(false);
  });

  it('should be on pending state and validate when changing dep', async () => {
    vi.useFakeTimers();
    vm.form.count = 1;
    await timeout(0);
    expect(vm.$regle.$pending).toBe(true);
    expect(vm.$regle.$fields.email.$pending).toBe(true);

    vi.runAllTimers();
    await flushPromises();
    expect(vm.$regle.$pending).toBe(false);
    expect(vm.$regle.$fields.email.$pending).toBe(false);

    expect(vm.$regle.$fields.email.$error).toBe(true);
    expect(vm.$errors.email).toStrictEqual(['Error']);
  });
});