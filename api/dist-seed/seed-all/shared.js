"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_REFERENCE_DATE = void 0;
exports.daysAgo = daysAgo;
exports.daysFromNow = daysFromNow;
exports.SEED_REFERENCE_DATE = new Date('2026-01-15T12:00:00.000Z');
function daysAgo(days) {
    return new Date(exports.SEED_REFERENCE_DATE.getTime() - days * 24 * 60 * 60 * 1000);
}
function daysFromNow(days) {
    return new Date(exports.SEED_REFERENCE_DATE.getTime() + days * 24 * 60 * 60 * 1000);
}
