import 'reflect-metadata';
import {Type} from "./type";

export class Container {

    private static readonly dependencies: Map<string, Object> = new Map();

    /**
     * Resolve a dependency from the container.
     * Will automatically resolve all dependencies of the requested dependency.
     *
     * @param dependency
     */
    static resolve<T>(dependency: Type<any>): T {
        // Check if class has @Dependency decorator
        if (!Reflect.getMetadata('design:paramtypes', dependency)) {
            throw new Error(`Class ${dependency.name} is not a dependency`);
        }

        // Get the dependency instance from the container
        if (this.dependencies.has(dependency.constructor.name)) {
            return this.dependencies.get(dependency.constructor.name) as T;
        }

        // Dependency not found in container, create a new instance
        return this.createInstance(dependency);
    }

    /**
     * Create a new instance of a dependency.
     * Will automatically resolve all dependencies of the requested dependency.
     *
     * @param dependency
     * @private
     */
    private static createInstance<T>(dependency: Type<any>): T {
        // Gather all constructor arguments of the dependency
        const tokens = Reflect.getMetadata('design:paramtypes', dependency) || [];

        // Resolve all constructor dependencies
        const constructorArgs = tokens.filter((token: any) => this.isDependency(token))
                                      .map((token: any) => this.resolve<any>(token));

        // Create a new instance of the dependency
        const newInstance = new dependency(...constructorArgs);

        // Create a new instance of the dependency
        this.dependencies.set(newInstance.constructor.name, dependency);

        console.log(`[DI] Created new instance of ${newInstance.constructor.name}`);

        return newInstance;
    }

    /**
     * Clear the container.
     */
    static clear(): void {
        this.dependencies.clear();
    }

    private static isDependency(token: any): boolean {
        return Reflect.getMetadata('design:paramtypes', token) !== undefined;
    }
}