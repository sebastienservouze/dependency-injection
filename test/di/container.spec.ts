import {Container} from "../../src/di/container";
import {Dependency} from "../../src/di/dependency.decorator";

@Dependency()
class SimpleDependency {
    constructor() {}
}

@Dependency()
class DependencyWithDependency {
    constructor(private readonly childDependency: SimpleDependency) {}
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

    it('should get a simple dependency', () => {
        const result = Container.get<SimpleDependency>(SimpleDependency);

        expect(result).toBeInstanceOf(SimpleDependency);
    });

    it('should get a dependency and its own dependency tree', () => {
        const result = Container.get<DependencyWithDependency>(DependencyWithDependency);

        expect(result).toBeInstanceOf(DependencyWithDependency);
        expect(result['childDependency']).toBeInstanceOf(SimpleDependency);
    });

    it('should not get a dependency with a non-dependency constructor argument', () => {
        const result = Container.get<DependencyWithoutDependency>(DependencyWithoutDependency);

        expect(result).toBeInstanceOf(DependencyWithoutDependency);
        expect(result['notADependency']).toBeUndefined();
    });

    it('should throw an error when trying to get a class that is not a dependency', () => {
        expect(() => Container.get<NotADependency>(NotADependency)).toThrow(`Can't get type NotADependency as a dependency. NotADependency is missing the @Dependency decorator`);
    });

    it('should set an instance of a dependency', () => {
        const instance = new DependencyWithoutDependency(new NotADependency());
        Container.set(instance);

        const result = Container.get<DependencyWithoutDependency>(DependencyWithoutDependency);

        expect(result).toBe(instance);
    });

    it('should throw an error when trying to set a type instead of a class', () => {
        expect(() => Container.set(SimpleDependency)).toThrow(`Can't set type SimpleDependency as a dependency. SimpleDependency is a type`);
    });
    
    it('should remove all dependencies from the container', () => {
        Container.get(SimpleDependency);
        Container.get(DependencyWithDependency);

        Container.clear();
    });
    
    it('should remove a dependency from its type', () => {
        Container.set(new SimpleDependency());
        
        Container.clear(SimpleDependency);
        
        expect(Container['dependencies'].size).toBe(0);
    });
    
    it('should remove all dependencies', () => {
        Container.get(SimpleDependency);
        
        Container.clear();
        
        expect(Container['dependencies'].size).toBe(0);
    });
    
});