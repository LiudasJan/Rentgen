import { TestOptions } from '../types';

export const NOT_AVAILABLE_TEST = 'Not available';

export abstract class BaseTests {
  constructor(
    protected options: TestOptions,
    protected onTestStart?: () => void,
  ) {
    this.options = options;
    this.onTestStart = onTestStart;
  }

  public abstract run(): any;
}
