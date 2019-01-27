const _ = require('lodash');
const lockSchema = require('./schemas/lock');
const constants = require('./constants');
const utils = require('./utils');

class LockManager {
    constructor() {
        this.Lock = null;
        this.connection = null;
    }

    init(connection, collectionName = constants.DEFAULT_COLLECTION) {
        this.connection = connection;
        this.Lock = this.connection.model(collectionName || constants.DEFAULT_COLLECTION, lockSchema);
    }

    waitLock(id, ttl, timeout = constants.RETRY_TIMEOUT_RANGE.max) {
        if (!this.Lock) {
            return Promise.reject(utils.error(constants.ERRORS.NOT_INITIALIZED.code, constants.ERRORS.NOT_INITIALIZED.message));
        }

        timeout = _.isNumber(timeout) && timeout > 0 ? timeout : constants.MAX_TIMEOUT;
        return utils.attemp(() => this.lock(id, ttl), timeout);
    }

    lock(id, ttl = 0) {
        if (!this.Lock) {
            return Promise.reject(utils.error(constants.ERRORS.NOT_INITIALIZED.code, constants.ERRORS.NOT_INITIALIZED.message));
        }

        const query = {
            name: id,
            expireAt: {
                $exists: true,
                $ne: null,
                $lt: Date.now()
            }
        };

        const doc = {
            name: id
        };

        if (_.isNumber(ttl) && _.isFinite(ttl) && ttl > 0) {
            doc.expireAt = Date.now() + (ttl * 1000);
        }

        return this.Lock.findOneAndUpdate(query, doc, {
                new: true,
                upsert: true
            })
            .then(() => {
                return () => {
                    return model.findOneAndDelete({
                            name: id
                        })
                        .then(_.noop)
                        .catch(_.noop);
                }
            })
            .catch(err => {
                if (err.code === 11000) {
                    return Promise.reject(
                        utils.error(constants.ERRORS.LOCK_PENDING.code,
                            constants.ERRORS.LOCK_PENDING.message)
                    );
                }
                return Promise.reject(
                    utils.error(constants.ERRORS.UNKNOWN_ERROR.code,
                        `${constants.ERRORS.UNKNOWN_ERROR.message} (code: ${err.code},codeName: ${err.codeName})`
                    )
                );
            });
    }

}

module.exports = LockManager;