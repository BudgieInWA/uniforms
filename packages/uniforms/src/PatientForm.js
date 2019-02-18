import isFunction   from 'lodash/isFunction';

import AutoForm from './AutoForm';

const isPromise = p => !!(p && isFunction(p.then));

const Patient = parent => class extends parent {
    static Patient = Patient;

    static displayName = `Patient${parent.displayName}`;

    static defaultProps = { ...parent.defaultProps };

    static propTypes = { ...parent.propTypes };

    constructor () {
        super(...arguments);

        this.state = {
            ...this.state,

            waiting: false,
        };

        this.waitingResolves = new Set();
        this.waitingRejects = new Set();
        this.waitingOn = new Set();

        this.onValidate = this.validate = this.onValidate.bind(this);
    }

    __reset (state) {
        this.waitingRejects.forEach(reject => reject(new Event('abort')));
        this.waitingResolves = new Set();
        this.waitingRejects = new Set();
        this.waitingOn = new Set();
        return {...super.__reset(state), waiting: false};
    }

    /**
     * @private
     * @param {Promise} p - A promise that we should wait on.
     */
    waitOn(p) {
        this.waitingOn.add(p);
        p.then(() => this.waitedOn(p)).catch(() => this.waitedOn(p, true));
        this.setState({ waiting: true });
    }

    /**
     * @private
     * @param {Promise} p - A promise that we should no longer wait on.
     * @param {boolean} abort - Should we abort waiting.
     */
    waitedOn(p, { abort }) {
        this.waitingOn.delete(p);
        if (this.waitingOn.size === 0) {
            this.setState({ waiting: false });
        }

        if (abort) {
            // Trigger abort.
            this.waitingRejects.forEach(reject => reject(new Event('abort')));
        } else if (this.waitingOn.size === 0) {
            // Trigger done.
            this.waitingResolves.forEach(resolve => resolve());
        } else {
            // Don't trigger anything.
            return;
        }
        // Finish trigger.
        this.waitingResolves = new Set();
        this.waitingRejects = new Set();
    }

    /**
     * @returns {Promise<void>} - A promise to finish waiting on any pending changes.
     * It will reject if a change rejects. It will resolve when there are no pending changes.
     */
    async changing() {
        if (this.waitingOn.size === 0) {
           return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.waitingResolves.add(resolve);
            this.waitingRejects.add(reject);
        });
    }

    /** If value is a promise, the form will wait and the resolved value will be used. */
    onChange (key, value, ...args) {
        if (isPromise(value)) {
            this.waitOn(value.then(resolvedValue => super.onChange(key, resolvedValue, ...args)));
        } else {
            super.onValidate(...arguments);
        }
    }

    /** Submit the form once all changes have completed. */
    async onValidate (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        await this.changing();
        return super.onValidate(event);
    }
};

export default Patient(AutoForm);
