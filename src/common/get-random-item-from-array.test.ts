import { expect, test } from 'bun:test';
import { getRandomItemFromArray } from 'src/common/get-random-item-from-array';

test('gets random item from array', () => {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(getRandomItemFromArray(array)).toBeNumber();
    expect(getRandomItemFromArray([])).toBeUndefined();
    expect(getRandomItemFromArray(['hi'])).toBeString();
    expect(getRandomItemFromArray(['hi'])).toBe('hi');
});
