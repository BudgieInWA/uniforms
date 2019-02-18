import React    from 'react';
import {mount, shallow}  from 'enzyme';

import PatientForm from 'uniforms/PatientForm';
import AutoForm from 'uniforms/AutoForm';

jest.mock('meteor/aldeed:simple-schema');
jest.mock('meteor/check');

const makePromise = () => {
    let resolve, reject;
    const promise = new Promise((a, b) => { resolve = a; reject = b; });
    return { promise, resolve, reject };
};

describe('PatientForm', () => {
    const onSubmit = jest.fn();
    const validator = jest.fn();
    const model = {a: 1};
    const schema = {
        getDefinition:  () => ({type: String, defaultValue: ''}),
        messageForError () {},
        objectKeys:     () => ['a', 'b', 'c'],
        validator:      () => validator
    };

    beforeEach(() => {
        onSubmit.mockReset();
        validator.mockReset();
    });

    describe.skip('with an async change', () => {
        let wrapper, form;
        beforeEach(() => {
            // const wrapper = shallow(
            //     <PatientForm model={model} schema={schema} onSubmit={onSubmit} />
            // );
            // const form = wrapper.instance()
        });
        it('enters waiting state', async () => {

        });

        it('leaves waiting state when the last change resolves', async () => {

        });
        it('leaves waiting state when the last change rejects', async () => {

        });

        it('does not leave waiting state when an additional change resolves', async () => {

        });
        it('does not leave waiting state when an additional change rejects', async () => {

        });
    });

    describe('when validating', () => {
        let wrapper, form;
        beforeEach(() => {
            // console.log('beforeveforeeach', { wrapper, form });
            // FIXME mount nor shallow are working.
            wrapper = mount(<PatientForm model={model} schema={schema} onSubmit={onSubmit} />);
            // console.log('between', { wrapper, form });
            form = wrapper.instance();
            // console.log('afterbeforeeach', { wrapper, form });
        });

        it('defers validation while waiting for changes', async () => {
            const { promise, resolve, reject } = makePromise();
            form.change({ a: promise });
            form.onValidate();

            // await new Promise(resolve => process.nextTick(resolve));
            expect(validator).not.toHaveBeenCalled();
        });

        it('performs validation after last change resolves', async () => {
            const { promise, resolve, reject } = makePromise();
            form.change('a', promise);
            const validating = form.onValidate();

            validator.mockReset();
            resolve();
            // await new Promise(resolve => process.nextTick(resolve));
            expect(validator).toHaveBeenCalled();
            await validating; // Is this what validating does?
        });

        it('aborts validation after any change rejects', async () => {
            const { promise, resolve, reject } = makePromise();
            form.change('a', promise);
            const validating = form.onValidate();

            validator.mockReset();
            reject();
            // await new Promise(resolve => process.nextTick(resolve));
            expect(validator).not.toHaveBeenCalled();
            try {
                await validating; // Is this what validating does?
                // TODO fail test, validation should fail, (I think)
            } catch (error) {
                expect(error).toBe(expect.objectContaining({ type: 'abort'}));
            }
        });
        // it('aborts submission after any change rejects', async () => {
        // });
    });
});
