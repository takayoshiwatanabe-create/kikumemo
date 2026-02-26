import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combines multiple class names correctly', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles conditional class names', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class');
    expect(result).toBe('base-class active-class');
  });

  it('filters out falsy values', () => {
    const result = cn('class1', null, undefined, false, '', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles arrays of class names', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles nested arrays of class names', () => {
    const result = cn(['class1', ['class2', 'class3']], 'class4');
    expect(result).toBe('class1 class2 class3 class4');
  });

  it('merges Tailwind CSS classes correctly', () => {
    const result = cn('p-4', 'p-6', 'bg-red-500', 'bg-blue-500');
    // Tailwind-merge should pick the last conflicting class
    expect(result).toBe('p-6 bg-blue-500');
  });

  it('merges complex Tailwind CSS classes', () => {
    const result = cn('text-red-500', 'font-bold', 'text-lg', 'text-blue-400');
    expect(result).toBe('font-bold text-lg text-blue-400');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn(null, undefined, false, '')).toBe('');
    expect(cn([])).toBe('');
  });

  it('combines regular classes with Tailwind-merged classes', () => {
    const result = cn('my-custom-class', 'p-4', 'p-6', 'bg-red-500');
    expect(result).toBe('my-custom-class p-6 bg-red-500');
  });

  it('maintains order for non-conflicting classes', () => {
    const result = cn('flex', 'items-center', 'justify-between');
    expect(result).toBe('flex items-center justify-between');
  });
});
