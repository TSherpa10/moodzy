"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsersStore = void 0;
// frontend/src/stores/users.ts
var pinia_1 = require("pinia");
var vue_1 = require("vue");
var BASE = 'http://localhost:3000';
exports.useUsersStore = (0, pinia_1.defineStore)('users', function () {
    // state
    var users = (0, vue_1.ref)([]);
    var loading = (0, vue_1.ref)(false);
    var error = (0, vue_1.ref)(null);
    var fetchedOnce = (0, vue_1.ref)(false);
    // getters
    var count = (0, vue_1.computed)(function () { return users.value.length; });
    var realUsers = (0, vue_1.computed)(function () { return users.value.filter(function (u) { return u.isReal; }); });
    var fakeUsers = (0, vue_1.computed)(function () { return users.value.filter(function (u) { return !u.isReal; }); });
    var byId = function (id) { var _a; return (_a = users.value.find(function (u) { return u.id === id; })) !== null && _a !== void 0 ? _a : null; };
    // helpers
    function json(url, init) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch(url, __assign({ cache: 'no-store', headers: __assign({ 'Content-Type': 'application/json' }, ((_a = init === null || init === void 0 ? void 0 : init.headers) !== null && _a !== void 0 ? _a : {})) }, init))];
                    case 1:
                        res = _c.sent();
                        if (!res.ok)
                            throw new Error("".concat((_b = init === null || init === void 0 ? void 0 : init.method) !== null && _b !== void 0 ? _b : 'GET', " ").concat(url, " \u2192 ").concat(res.status));
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, (_c.sent())];
                }
            });
        });
    }
    // actions
    function fetchUsers() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        loading.value = true;
                        error.value = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        _a = users;
                        return [4 /*yield*/, json("".concat(BASE, "/users"))];
                    case 2:
                        _a.value = _b.sent();
                        fetchedOnce.value = true;
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _b.sent();
                        error.value = e_1;
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function ensureLoaded() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!fetchedOnce.value) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetchUsers()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    }
    function addUser(payload) {
        return __awaiter(this, void 0, void 0, function () {
            var created;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        error.value = null;
                        return [4 /*yield*/, json("".concat(BASE, "/users"), {
                                method: 'POST',
                                body: JSON.stringify({
                                    name: payload.name.trim(),
                                    mood: payload.mood.trim(),
                                    isReal: (_a = payload.isReal) !== null && _a !== void 0 ? _a : true,
                                }),
                            })];
                    case 1:
                        created = _b.sent();
                        users.value.unshift(created);
                        return [2 /*return*/, created];
                }
            });
        });
    }
    function addSimulatedUser(payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, addUser(__assign(__assign({}, payload), { isReal: false }))];
            });
        });
    }
    function updateUser(id, patch) {
        return __awaiter(this, void 0, void 0, function () {
            var saved, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error.value = null;
                        return [4 /*yield*/, json("".concat(BASE, "/users/").concat(id), { method: 'PATCH', body: JSON.stringify(patch) })];
                    case 1:
                        saved = _a.sent();
                        i = users.value.findIndex(function (u) { return u.id === id; });
                        if (i !== -1)
                            users.value[i] = saved;
                        return [2 /*return*/, saved];
                }
            });
        });
    }
    function removeUser(id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error.value = null;
                        return [4 /*yield*/, fetch("".concat(BASE, "/users/").concat(id), { method: 'DELETE' }).then(function (res) {
                                if (!res.ok && res.status !== 204)
                                    throw new Error("DELETE /users/".concat(id, " \u2192 ").concat(res.status));
                            })];
                    case 1:
                        _a.sent();
                        users.value = users.value.filter(function (u) { return u.id !== id; });
                        return [2 /*return*/, true];
                }
            });
        });
    }
    // NEW: light polling to keep in sync with backend REST
    function startPolling(intervalMs) {
        var _this = this;
        if (intervalMs === void 0) { intervalMs = 2000; }
        var timer = null;
        var tick = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fetchUsers()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        tick(); // immediate sync
        timer = window.setInterval(tick, intervalMs);
        // return disposer to stop polling on unmount/navigation
        return function () { if (timer != null) {
            clearInterval(timer);
            timer = null;
        } };
    }
    function setUsers(list) { users.value = __spreadArray([], list, true); }
    function clear() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(BASE, "/users"), { method: 'DELETE' }).then(function (res) {
                            if (!res.ok && res.status !== 204)
                                throw new Error("DELETE /users \u2192 ".concat(res.status));
                        })];
                    case 1:
                        _a.sent();
                        users.value = [];
                        fetchedOnce.value = false;
                        return [2 /*return*/, true];
                }
            });
        });
    }
    return {
        users: users,
        loading: loading,
        error: error,
        fetchedOnce: fetchedOnce,
        count: count,
        realUsers: realUsers,
        fakeUsers: fakeUsers,
        byId: byId,
        ensureLoaded: ensureLoaded,
        fetchUsers: fetchUsers,
        addUser: addUser,
        addSimulatedUser: addSimulatedUser,
        updateUser: updateUser,
        removeUser: removeUser,
        setUsers: setUsers,
        clear: clear,
        startPolling: startPolling,
    };
});
