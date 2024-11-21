import type { RegleFieldStatus, RegleStatus } from '@regle/core';

export function shouldBePristineField(field?: RegleStatus<any, any> | RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$errors).toEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeInvalidField(field?: RegleStatus<any, any> | RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeErrorField(field?: RegleStatus<any, any> | RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(true);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeValidField(field?: RegleStatus<any, any> | RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(true);
  expect(field?.$errors).toEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}
