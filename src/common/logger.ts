import { noop } from './noop';

export const logger = process.env.NODE_ENV === 'test' ? ({ warn: noop, debug: noop, info: noop, error: noop } as typeof console) : console;
