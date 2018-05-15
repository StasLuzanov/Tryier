"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validate_1 = require("./validate");
var User = /** @class */ (function () {
    function User(data) {
        this.userName = validate_1.Validate.string(data, 'userName', true, null);
        this.email = validate_1.Validate.string(data, 'email', true, null);
        this.fullName = validate_1.Validate.string(data, 'fullName', true, null);
        this.password = validate_1.Validate.string(data, 'password', true, null);
        this.isAdmin = validate_1.Validate.boolean(data, 'isAdmin', false, false);
    }
    ;
    return User;
}());
exports.User = User;
;
//# sourceMappingURL=user.js.map