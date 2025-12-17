import 'reflect-metadata';

export function Abortable(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (this.aborted) return;
    return original.apply(this, args);
  };
}

export function Test(description?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('test:description', description, target, propertyKey);
    Reflect.defineMetadata('test:method', true, target, propertyKey);
  };
}

export function getTestCount(target: any): number {
  const prototype = target.prototype || Object.getPrototypeOf(target);
  const methodNames = Object.getOwnPropertyNames(prototype);

  let count = 0;
  for (const methodName of methodNames) {
    if (methodName === 'constructor') continue;

    const isTest = Reflect.getMetadata('test:method', prototype, methodName);
    if (isTest) count++;
  }

  return count;
}
