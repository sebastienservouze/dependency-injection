import {Container} from "../../src/di/container";
import {Dependency} from "../../src/di/dependency.decorator";

@Dependency()
class SimpleDependency {
    constructor() {}
}

@Dependency()
class DependencyWithDependency {
    constructor(private readonly dependencyA: SimpleDependency) {}
}

class NotADependency {
    constructor() {}
}

@Dependency()
class DependencyWithoutDependency {
    constructor(private readonly notADependency: NotADependency) {}
}

describe("Container IT", () => {

    beforeEach(() => {
        Container.clear();
    });

    it('should resolve a simple dependency', () => {
        const result = Container.resolve<SimpleDependency>(SimpleDependency);

        expect(result).toBeInstanceOf(SimpleDependency);
    });

    it('should resolve a dependency and its own dependency tree', () => {
        const result = Container.resolve<DependencyWithDependency>(DependencyWithDependency);

        expect(result).toBeInstanceOf(DependencyWithDependency);
        expect(result['dependencyA']).toBeInstanceOf(SimpleDependency);
    });

    it('should not resolve a dependency with a non-dependency constructor argument', () => {
        const result = Container.resolve<DependencyWithoutDependency>(DependencyWithoutDependency);

        expect(result).toBeInstanceOf(DependencyWithoutDependency);
        expect(result['notADependency']).toBeUndefined();
    });

    it('should register an instance of a dependency', () => {
        const instance = new DependencyWithoutDependency(new NotADependency());
        Container.register(instance);

        const result = Container.resolve<DependencyWithoutDependency>(DependencyWithoutDependency);

        expect(result).toBe(instance);
    });

    it('should throw an error when trying to resolve a class that is not a dependency', () => {
        expect(() => Container.resolve<NotADependency>(NotADependency)).toThrow('Class NotADependency is not a dependency');
    });
});