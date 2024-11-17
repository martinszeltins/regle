---
title: Rules properties
---

# Validation properties

Validation properties are computed values or methods available in every nested rule status (including `regle`)


Let's make a simple exemple to explain the different properties

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';
import {ref} from 'vue';

const form = ref({email: '', user: {firstName: '', lastName: ''}});

const {regle, errors} = useRegle(form, {
  email: {required},
  user: {
    firstName: {required},
  }
})

regle.$fields.email.$rules.required.
//                                  ^|
</script>

<template>
  <input v-model='form.user.firstName' placeholder='Type your firstName'/>
  <ul>
    <li v-for="error of errors.user.firstName" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>
```
<br/><br/><br/><br/>

## Computed properties for rules


### `$valid`
- Type: `readonly boolean`
  
Indicates the state of validation for this validator


### `$pending`
- Type: `readonly boolean`
  

If the rule is async, indicates if it's currently pending. Always false if it's synchronous.


### `$message`
- Type: `readonly string | string[]`

Returns the current rule computed error message or messages


### `$active`
- Type: `readonly boolean`
  
Indicated whether or not the rule is enabled (for rules like `requiredIf`)



### `$type`
- Type: `readonly string`

The rule type name

### `$validator`
- Type: `readonly (value, ...metadata) => boolean | {$valid: true, [x:string]: any}`

Returns the original rule validator function

### `$path`
- Type: `readonly string[]`

Returns the current path of the rule (used internally for tracking)

## Common methods for rules


### `$validate`
- Type: `() => Promise<boolean>`

Run the rule validator and compute its properties like `$message` and `$active`

### `$reset`
- Type: `() => void`

Reset the `$valid`, `$metadata` and `$pending` states