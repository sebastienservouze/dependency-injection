# @nerisma/di

[![npm version](https://badge.fury.io/js/%40nerisma%2Fdi.svg)](https://badge.fury.io/js/%40nerisma%2Fdi)

## Installation
```bash
npm install @nerisma/di
```

## Description

This is a simple dependency injection library for TypeScript. It allows you to resolve dependencies automatically.

To be able to use a dependency, just mark its class with the `@Dependency` decorator and use the `Container.resolve` method to get an instance of it.

## Features

### Resolve a dependency 

To resolve a dependency, use the `Container.resolve` method.

**Note:** if the dependency does not yet exist in the container, it will be created and injected into to the container. 
If a dependency needs other dependencies, they will be resolved and injected as well.

```typescript
import {Container, Dependency} from '@nerisma/di';

@Dependency() // This is needed to enable dependency resolution via the constructor
class A {
    constructor(public b: B) {}
}

@Dependency() // This is needed to be injected
class B {
    constructor() {}
}

const a = Container.resolve<A>(A);
console.log(a.b); // This will print an instance of B
```

### Add a specific instance to the container

You may want to add a specific instance to the container manually, you can use the `Container.inject` method.

```typescript
import {Container, Dependency} from '@nerisma/di';

@Dependency()
class A {
    constructor() {}
}

const a = new A();

// This will inject 'a' as the instance of A into the container
Container.inject(a);
```

### Inject a class that is not decorated with `@Dependency`

Sometimes you might want to inject a class that is not decorated with `@Dependency` so its instance can be injected in a dependecy.

You can do this by using the `Container.inject` method with the `force` parameter inject to `true`.

```typescript
import {Container, Dependency} from '@nerisma/di';

class A {
    constructor() {}
}

@Dependency()
class B {
    constructor(public a: A) {}
}

const a = new A();
Container.inject(a, true); // a is now injectable in any dependency

const b = Container.resolve<B>(B);
console.log(b.a); // This will print an instance of A)
```

### Clearing the container

To clear the container of all dependencies, use the `Container.clear` method without any arguments.

You can also clear the container of specific types by providing those types as arguments.

```typescript
import {Container, Dependency} from '@nerisma/di';

Container.clear(); // This will clear all dependencies
Container.clear(A); // This will clear instance of A

const dependencies = [A, B];
Container.clear(...dependencies); // This will clear instance of A and B
Container.clear(A, B); // This will also clear instance of A and B
```