# Installation
```bash
npm install @nerisma/di
```

# Description

This is a simple dependency injection library for TypeScript. It allows you to create instances of classes and inject their dependencies automatically.

To be able to inject dependencies, you need to use the `@Dependency` decorator on the classes that you want to be injected.

# Features

## Get a dependency (and create it if it doesn't exist)

Usual way to get a dependency is to use the `Container.get` method. This method **will create** an instance of the provided class if it doesn't exist in the container.

It will also inject dependencies of the provided class in the same way.

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

// This will create an instance of A, add it to the container, create and inject B in the container & A as well
const a = Container.get<A>(A);
```

## Manually adding an instance to the container

If you want to add an instance to the container manually, you can use the `Container.set` method.

```typescript
import {Container, Dependency} from '@nerisma/di';

@Dependency()
class A {
    constructor() {}
}

const a = new A();

// This will set the instance of A to the container
Container.set(a);
```

## Clearing the container

If you want to clear the container of all types, you can use the `Container.clear` method without any arguments.

If you want to clear the container of specific types, you can provide those types as arguments.

```typescript
/**
 * Clears the container of all instances of the provided types
 * 
 * @param instanceOrType The types to clear from the container
 */
static clear(...instanceOrType: Type<any>[]): void 
```