import {Container} from "../../src/di/container";
import {Dependency} from "../../src/di/dependency.decorator";

@Dependency()
class SimpleDependency {
    constructor() {}
}

@Dependency()
class DependencyWithDependency {
    constructor(public readonly childDependency: SimpleDependency) {}
}

class NotADependency {
    constructor() {}
}

@Dependency()
class DependencyWithoutDependency {
    constructor(public readonly notADependency: NotADependency) {}
}

describe("Container IT", () => {

    beforeEach(() => {
        Container.clear();
    });

    it('should get a simple dependency', () => {
        const result = Container.resolve<SimpleDependency>(SimpleDependency);

        expect(result).toBeInstanceOf(SimpleDependency);
    });

    it('should get a dependency and its own dependency tree', () => {
        const result = Container.resolve<DependencyWithDependency>(DependencyWithDependency);

        expect(result).toBeInstanceOf(DependencyWithDependency);
        expect(result.childDependency).toBeInstanceOf(SimpleDependency);
    });

    it('should throw an error when failing to resolve any constructor args of the dependency to resolve', () => {
        expect(() => Container.resolve(DependencyWithoutDependency)).toThrow(`Can't get type NotADependency as a dependency. NotADependency is missing the @Dependency decorator`);
    });

    it('should throw an error when trying to get a class that is not a dependency', () => {
        expect(() => Container.resolve<NotADependency>(NotADependency)).toThrow(`Can't get type NotADependency as a dependency. NotADependency is missing the @Dependency decorator`);
    });

    it('should set an instance of a dependency', () => {
        const instance = new SimpleDependency();
        Container.inject(instance);

        const result = Container.resolve<SimpleDependency>(SimpleDependency);

        expect(result).toBe(instance);
    });

    it('should set an instance of a non dependency if force is true', () => {
        const instance = new NotADependency();
        Container.inject(instance, true);

        const result = Container.resolve<DependencyWithoutDependency>(DependencyWithoutDependency);

        expect(result.notADependency).toBe(instance);
    });

    it('should throw an error when trying to set a type instead of a class', () => {
        expect(() => Container.inject(SimpleDependency)).toThrow(`Can't set type SimpleDependency as a dependency. SimpleDependency is a type`);
    });
    
    it('should remove all dependencies from the container', () => {
        Container.resolve(SimpleDependency);
        Container.resolve(DependencyWithDependency);

        Container.clear()

        Container.clear();
    });
    
    it('should remove a dependency from its type', () => {
        Container.inject(new SimpleDependency());
        
        Container.clear(SimpleDependency);
        
        expect(Container['dependencies'].size).toBe(0);
    });
    
    it('should remove all dependencies', () => {
        Container.resolve(SimpleDependency);
        
        Container.clear();
        
        expect(Container['dependencies'].size).toBe(0);
    });
    
});