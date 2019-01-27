const RETRY_INTERVAL_RANGE = {
    min: 100,
    max: 1000
};

const RETRY_TIMEOUT_RANGE = {
    min: 100,
    max: 31556952000
};

const DEFAULT_COLLECTION = 'Locks';

const ERRORS = {
    NOT_INITIALIZED: {
        code: 'NOT_INITIALIZED',
        message: 'missing mongoose connection, LockManager must be initialize with a mongoose connection',
    },
    UNKNOWN_ERROR: {
        code: 'UNKNOWN_ERROR',
        message: 'an unkown error occurred'
    },
    LOCK_PENDING: {
        code: 'LOCK_PENDING',
        message: 'impossible to acquire lock (already locked by others)'
    }
}

module.exports = {
    DEFAULT_COLLECTION,
    ERRORS,
    RETRY_INTERVAL_RANGE,
    RETRY_TIMEOUT_RANGE
};