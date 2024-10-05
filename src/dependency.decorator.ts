import {Type} from "./type";

/**
 * Decorator to mark a class as a dependency.
 * Will be used by the container to resolve dependencies.
 *
 * @constructor
 */
export const Dependency = (): (target: Type<any>) => void => {
    return (): void => {};
}