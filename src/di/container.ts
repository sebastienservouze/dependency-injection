import 'reflect-metadata';
import {Type} from "./type";
import {MetadataKeys} from "./metadata-keys.enum";

export class Container {

    private static readonly dependencies: Map<string, Object> = new Map();

    /**
     * Get a dependency from the container.
     * Creates a new instance of the dependency if it is not already in the container.
     * If it has dependencies, it will resolve them as well.
     *
     * @param dependency
     */
    public static resolve<T>(dependency: Type<any>): T {
        // Check if class has dependency metadata
        if (!Reflect.getMetadata(MetadataKeys.IsDependency, dependency)) {
            throw new Error(`Can't get type ${dependency.name} as a dependency. ${dependency.name} is missing the @Dependency decorator`);
        }

        // Get the dependency instance from the container
        if (this.dependencies.has(dependency.name)) {
            return this.dependencies.get(dependency.name) as T;
        }

        // Dependency not found in container, create a new instance of it
        return this.instantiateAndResolve(dependency);
    }

    /**
     * Create a new instance of a dependency.
     * Will automatically get (or create) all dependencies of
     * the requested dependency and store them in container.
     *
     * @param dependency
     * @private
     */
    private static instantiateAndResolve<T>(dependency: Type<any>): T {
        if (typeof dependency !== 'function') {
            throw new Error(`Can't create instance of ${dependency}. ${dependency} is not a class`);
        }

        // Gather all constructor arguments of the dependency
        const constructorArgs = Reflect.getMetadata(MetadataKeys.ConstructorArgs, dependency) || [];

        // Resolve all constructor dependencies
        const resolvedConstructorArgs = constructorArgs.filter((token: any) => this.isDependency(token))
            .map((token: any) => this.resolve<any>(token));

        // Create a new instance of the dependency
        const newInstance = new dependency(...resolvedConstructorArgs);

        // Create a new instance of the dependency
        this.dependencies.set(newInstance.constructor.name, newInstance);

        return newInstance;
    }

    /**
     * Inject an instance of a dependency into the container.
     *
     * @param instance
     * @param force - Set the instance even if it is not a dependency
     */
    public static inject(instance: Object, force: boolean = false): void {
        if (typeof instance === 'function') {
            throw new Error(`Can't set type ${instance.name} as a dependency. ${instance.name} is a type`);
        }

        const prototype = Object.getPrototypeOf(instance);

        if (force) {
            Reflect.defineMetadata(MetadataKeys.IsDependency, true, prototype.constructor);
            this.dependencies.set(prototype.constructor.name, instance);
            return;
        }

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