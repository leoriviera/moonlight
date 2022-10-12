import { IObject } from './objects';

export class Environment {
    store: Map<string, IObject>;
    outerEnv: Environment | null;

    constructor(outerEnv: Environment | null = null) {
        this.store = new Map();
        this.outerEnv = outerEnv;
    }

    get(name: string): IObject | undefined {
        const value = this.store.get(name);

        if (value === undefined && this.outerEnv) {
            return this.outerEnv.get(name);
        }

        return value;
    }

    set(name: string, value: IObject) {
        this.store.set(name, value);
    }

    clone() {
        const env = new Environment(this.outerEnv);
        env.store = new Map(this.store);
        return env;
    }
}
