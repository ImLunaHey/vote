export const getRandomItemFromArray = <T>(array: T[]): T | undefined => array[Math.floor(Math.random() * array.length)];
