import 'reflect-metadata';
import {Type} from "./type";
import {MetadataKeys} from "./metadata-keys.enum";

export class Container extends Map<string, Object> {

    private static readonly dependencies: Map<string, Object> = new Map();

    /**
     * Get a dependency from the container.
     * Creates a new instance of the dependency if it is not already in the container.
     *
     * @param dependency
     */
    public static get<T>(dependency: Type<any>): T {
        // Check if class has dependency metadata
        if (!Reflect.getMetadata(MetadataKeys.IsDependency, dependency)) {
            throw new Error(`Can't get type ${dependency.name} as a dependency. ${dependency.name} is missing the @Dependency decorator`);
        }

        // Get the dependency instance from the container
        if (this.dependencies.has(dependency.name)) {
            return this.dependencies.get(dependency.name) as T;
        }

        // Dependency not found in container, create a new instance of it
        return this.createAndStoreInstanceOf(dependency);
    }

    /**
     * Create a new instance of a dependency.
     * Will automatically get (or create) all dependencies of
     * the requested dependency and store them in container.
     *
     * @param dependency
     * @private
     */
    private static createAndStoreInstanceOf<T>(dependency: Type<any>): T {
        if (typeof dependency !== 'function') {
            throw new Error(`Can't create instance of ${dependency}. ${dependency} is not a class`);
        }

        // Gather all constructor arguments of the dependency
        const constructorArgs = Reflect.getMetadata(MetadataKeys.ConstructorArgs, dependency) || [];

        // Resolve all constructor dependencies
        const resolvedConstructorArgs = constructorArgs.filter((token: any) => this.isDependency(token))
            .map((token: any) => this.get<any>(token));

        // Create a new instance of the dependency
        const newInstance = new dependency(...resolvedConstructorArgs);

        // Create a new instance of the dependency
        this.dependencies.set(newInstance.constructor.name, newInstance);

        return newInstance;
    }

    /**
     * Register an instance of a dependency in the container.
     *
     * @param instance
     */
    public static set(instance: Object): void {
        if (typeof instance === 'function') {
            throw new Error(`Can't set type ${instance.name} as a dependency. ${instance.name} is a type`);
        }

        const prototype = Object.getPrototypeOf(instance);
        if (!Reflect.getMetadata(MetadataKeys.IsDependency, prototype.constructor)) {
            throw new Error(`Can't set type ${prototype.constructor.name} as a dependency. ${prototype.constructor.name} is missing the @Dependency decorator`);
        }

        this.dependencies.set(prototype.constructor.name, instance);
    }

    /**
     * Clear all dependencies from the container.
     * 
     * @param instanceOrType
     */
    public static clear(...instanceOrType: Type<any>[]): void {
        if (!instanceOrType.length) {
            this.dependencies.clear();
            return;
        }
        
        instanceOrType.forEach((instanceOrType) => {
            if (typeof instanceOrType !== 'function') {
                throw new Error(`Can't remove type ${instanceOrType}. ${instanceOrType} is not a class`);
            }
            
            this.dependencies.delete(instanceOrType.name);
        });
    }

    /**
     * Check if a class is a dependency by checking if it has the dependency metadata.
     *
     * @param dependency
     * @private
     */
    private static isDependency(dependency: any): boolean {
        return Reflect.getMetadata(MetadataKeys.IsDependency, dependency);
    }
}