---
title: Usage with Pinia
---

<script setup>
import ComponentA from '../parts/components/pinia/ComponentA.vue';
import ComponentB from '../parts/components/pinia/ComponentB.vue';
</script>

# Usage with Pinia

Since Regle is headless, you can use it anywhere in your app — whether in a composable or a store.

Using a Pinia store is an excellent way to avoid prop drilling with multiple properties while maintaining type inference seamlessly across your components.

## Using regle in a Pinia store

::: code-group
```ts twoslash include store [demo.store.ts] 
// @module: esnext
// @filename: demo.store.ts
// ---cut---
import { required, minLength, email } from '@regle/rules';
import { defineStore } from 'pinia';
import { useRegle } from '@regle/core';

export const useDemoStore = defineStore('demo-store', () => {
  const { r$ } = useRegle({ email: '' }, {
    email: { required, minLength: minLength(4), email }
  })

  return {
    r$
  }
})
```

``` vue twoslash [ComponentA.vue]
<template>
  <input v-model='r$.$value.email' placeholder='Type your email'/>
  <button type="button" @click="r$.$resetAll">Reset</button>
</template>

<script setup lang='ts'>
// @include: store
// @noErrors
// ---cut---
// @module: esnext
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);

</script>
```

``` vue twoslash [ComponentB.vue]
<template>
  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
// @include: store
// @noErrors
// ---cut---
// @module: esnext
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);
</script>
```

:::

Component A:

<ComponentA />

Component B:

<ComponentB />
