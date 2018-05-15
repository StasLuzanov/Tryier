import * as Promise from 'bluebird';
import { Validator } from 'class-validator';
const validator = new Validator();

export class Validate {

    public static validate<T>(validatorFunc: Function, expectedType: string, data: any, object: string, required: boolean = false, dflt: T = null) {
        if (new Validator().isEmpty(data[object])) {
            if (required) throw new Error(`Missing required data`);
            return dflt;
        } else {
            if (!validatorFunc(data[object])) {
                throw new TypeError(`invalid type for ${data[object]}, expected: ${expectedType} but got: ${typeof data[object]}`);
            }
            return data[object];
        }
    };

    public static string(data: any, object: string, required: boolean = false, dflt: string = null): string {
        return this.validate<string>(validator.isString, 'string', data, object, required, dflt);
    };

    public static boolean(data: any, object: string, required: boolean = false, dflt: boolean = false): boolean {
        return this.validate<boolean>(validator.isBoolean, 'boolean', data, object, required, dflt);
    };

};