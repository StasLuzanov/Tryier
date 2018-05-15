"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
var validator = new class_validator_1.Validator();
var Validate = /** @class */ (function () {
    function Validate() {
    }
    Validate.validate = function (validatorFunc, expectedType, data, object, required, dflt) {
        if (required === void 0) { required = false; }
        if (dflt === void 0) { dflt = null; }
        if (new class_validator_1.Validator().isEmpty(data[object])) {
            if (required)
                throw new Error("Missing required data");
            return dflt;
        }
        else {
            if (!validatorFunc(data[object])) {
                throw new TypeError("invalid type for " + data[object] + ", expected: " + expectedType + " but got: " + typeof data[object]);
            }
            return data[object];
        }
    };
    ;
    Validate.string = function (data, object, required, dflt) {
        if (required === void 0) { required = false; }
        if (dflt === void 0) { dflt = null; }
        return this.validate(validator.isString, 'string', data, object, required, dflt);
    };
    ;
    Validate.boolean = function (data, object, required, dflt) {
        if (required === void 0) { required = false; }
        if (dflt === void 0) { dflt = false; }
        return this.validate(validator.isBoolean, 'boolean', data, object, required, dflt);
    };
    ;
    return Validate;
}());
exports.Validate = Validate;
;
//# sourceMappingURL=validate.js.map