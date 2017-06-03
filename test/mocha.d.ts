declare function describe(name: string, func: Function): void
declare function it(should: string, func: (next: Function) => void): void
declare function beforeEach(func: Function): void