import { serverError } from './error';

export async function asyncWrapper<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw serverError(err);
  }
}
