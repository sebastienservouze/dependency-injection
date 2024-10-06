import 'reflect-metadata';
import {Type} from "./type";
import {MetadataKeys} from "./metadata-keys.enum";

const logger = require('pino')();

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
        if (!Reflect.getMetadata(MetadataKeys.IsDependency, dependency)) {
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
        const constructorArgs = Reflect.getMetadata(MetadataKeys.ConstructorArgs, dependency) || [];

        // Resolve all constructor dependencies
        const resolvedConstructorArgs = constructorArgs.filter((token: any) => this.isDependency(token))
                                                       .map((token: any) => this.resolve<any>(token));

        // Create a new instance of the dependency
        const newInstance = new dependency(...resolvedConstructorArgs);

        // Create a new instance of the dependency
        this.dependencies.set(newInstance.constructor.name, dependency);

        return newInstance;
    }

    /**
     * Clear the container.
     */
    static clear(): void {
        this.dependencies.clear();
    }

    /**
     * Check if a class is a dependency by checking if it has the @Dependency decorator.
     *
     * @param dependency
     * @private
     */
    private static isDependency(dependency: any): boolean {
        return Reflect.getMetadata(MetadataKeys.IsDependency, dependency);
    }
}