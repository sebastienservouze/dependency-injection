import {Container} from "../../src/di/container";
import {Dependency} from "../../src/di/dependency.decorator";

@Dependency()
class DependencyA {
    constructor() {}
}

@Dependency()
class DependencyB {
    constructor(private readonly dependencyA: DependencyA) {}
}

class NotADependency {
    constructor() {}
}

@Dependency()
class DependencyC {
    constructor(private readonly notADependency: NotADependency) {}
}

describe("Container IT", () => {

    beforeEach(() => {
        Container.clear();
    });

    it('should resolve a simple dependency', () => {
        const result = Container.resolve<DependencyA>(DependencyA);

        expect(result).toBeInstanceOf(DependencyA);
    });

    it('should resolve a dependency and its own dependency tree', () => {
        const result = Container.resolve<DependencyB>(DependencyB);

        expect(result).toBeInstanceOf(DependencyB);
        expect(result['dependencyA']).toBeInstanceOf(DependencyA);
    });

    it('should not resolve a dependency with a non-dependency constructor argument', () => {
        const result = Container.resolve<DependencyC>(DependencyC);

        expect(result).toBeInstanceOf(DependencyC);
        expect(result['notADependency']).toBeUndefined();
    });

    it('should throw an error when trying to resolve a class that is not a dependency', () => {
        expect(() => Container.resolve<NotADependency>(NotADependency)).toThrow('Class NotADependency is not a dependency');
    });
});