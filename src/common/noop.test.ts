import { expect, test } from 'bun:test';
import { noop } from 'src/common/noop';

test('it is a no-op function', () => {
    expect(noop).toBeFunction();
    expect(noop()).toBe(undefined);
});
