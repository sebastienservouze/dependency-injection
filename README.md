# Installation
```bash
npm install @nerisma/di
```

# Usage

## Résoudre une dépendance

```typescript
import {Container} from '@nerisma/di';
import {Dependency} from "./public-api";

@Dependency() // This is needed to enable dependency resolution via the constructor
class A {
    
    constructor(public b: B) {}
    
}

@Dependency() // This is needed to be injected
class B {
    
    constructor() {}
    
}

// This will create an instance of A, add it to the container, create and inject B as well
const a = Container.resolve<A>(A);
console.log(a.b); // B {}
```

## Vider le container

```typescript
import {Container} from '@nerisma/di';

Container.clear();
```

# Tests
```bash
npm run test
```