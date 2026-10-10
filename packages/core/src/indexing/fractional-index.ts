/**
 * Fractional indexing utility for z-ordering elements and page sequences.
 * Produces lexicographically orderable string keys: a0, a1, ... a05, etc.
 */

const BASE_62_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateInitialKey(): string {
  return 'a0';
}

export function generateKeyBetween(before: string | null, after: string | null): string {
  if (!before && !after) {
    return generateInitialKey();
  }

  if (!before && after) {
    // Generate key before 'after'
    const firstChar = after.charAt(0);
    const code = firstChar.charCodeAt(0);
    if (code > 97) {
      // 97 is 'a'
      return String.fromCharCode(code - 1) + '0';
    }
    return after + '0';
  }

  if (before && !after) {
    // Generate key after 'before'
    const firstChar = before.charAt(0);
    const code = firstChar.charCodeAt(0);
    return String.fromCharCode(code + 1) + '0';
  }

  if (before && after) {
    if (before >= after) {
      throw new Error(`Invalid fractional index order: before (${before}) >= after (${after})`);
    }

    let i = 0;
    while (i < before.length && i < after.length && before.charAt(i) === after.charAt(i)) {
      i++;
    }

    const prefix = before.substring(0, i);
    const beforeChar = before.charAt(i) || ' ';
    const afterChar = after.charAt(i) || '~';

    const beforeCode = beforeChar.charCodeAt(0);
    const afterCode = afterChar.charCodeAt(0);

    if (afterCode - beforeCode > 1) {
      const midCode = Math.floor((beforeCode + afterCode) / 2);
      return prefix + String.fromCharCode(midCode);
    } else {
      return before + 'V';
    }
  }

  return generateInitialKey();
}
