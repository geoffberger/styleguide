import $ from 'jquery';
import chai, { expect } from 'chai';
import chaiJquery from 'chai-jquery';

import validator, { VALIDATE_TRIGGER } from './validator';

chai.use(chaiJquery);

describe('Validator', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    fixture.cleanup()
  });

  const setupSimpleForm = () => {
    const $form = $(fixture.set(`
      <form>
        <input id="character" type="text" required>
        <input id="quote" type="text" data-validate-not-empty="true">
        <span ${VALIDATE_TRIGGER}="true" id="click-trigger">Click Trigger</span>
        <button type="submit">Submit</button>
      </form>
    `));

    const $required = $form.find('[required]');
    const $notEmpty = $form.find('[data-validate-not-empty]');
    const $clickTrigger = $form.find('#click-trigger');
    const successCallback = sandbox.spy();
    const errorCallback = sandbox.spy();
    validator($form[0], { successCallback, errorCallback });
    return { $form, $required, $notEmpty, $clickTrigger, successCallback, errorCallback };
  };

  describe('when performing a form submission', () => {
    it('should produce a valid form submission', () => {
      const { $form, $required, $notEmpty, successCallback, errorCallback } = setupSimpleForm();

      $required.val('Walter');
      $notEmpty.val(`I don't roll on shabbos`);
      $form
        .on('submit', () => false)
        .trigger('submit');

      expect(errorCallback).to.not.have.been.called;
      expect(successCallback).to.have.been.calledWith([$notEmpty[0]]);
    });

    it('should produce an invalid form submission', () => {
      const { $form, $required, $notEmpty, successCallback, errorCallback } = setupSimpleForm();
      $form
        .on('submit', () => false)
        .trigger('submit');

      expect(successCallback).to.not.have.been.called;
      expect(errorCallback).to.have.been.calledWith([$required[0], $notEmpty[0]]);
    });
  });

  describe('when performing a click trigger submission', () => {
    it('should perform a valid click trigger', () => {
      const { $required, $notEmpty, $clickTrigger, successCallback, errorCallback } = setupSimpleForm();

      $required.val('Donny');
      $notEmpty.val(`He peed on the Dude's rug`);
      $clickTrigger.trigger('click');

      expect(errorCallback).to.not.have.been.called;
      expect(successCallback).to.have.been.calledWith([$notEmpty[0]]);
    });

    it('should perform an invalid click trigger', () => {
      const { $required, $notEmpty, $clickTrigger, successCallback, errorCallback } = setupSimpleForm();
      $clickTrigger.trigger('click');

      expect(successCallback).to.not.have.been.called;
      expect(errorCallback).to.have.been.calledWith([$required[0], $notEmpty[0]]);
    });

    it('should be invalid and then valid a mixture of built in and custom', () => {
      const { $required, $notEmpty, $clickTrigger, successCallback, errorCallback } = setupSimpleForm();

      $clickTrigger.trigger('click');
      expect(errorCallback).to.have.been.calledWith([$required[0], $notEmpty[0]]);

      $required.val('Walter');
      $clickTrigger.trigger('click');
      expect(errorCallback).to.have.been.calledWith([$notEmpty[0]]);

      $notEmpty.val(`You're out of your element!`);
      $clickTrigger.trigger('click');

      expect(errorCallback).to.have.been.calledTwice;
      expect(successCallback).to.have.been.calledWith([$notEmpty[0]]);
    });
  });

  describe('when validating a not empty validator', () => {
    const setupNotEmpty = () => {
      const $form = $(fixture.set(`
        <div>
          <input id="drink" type="text" data-validate-not-empty="true" placeholder="What's your drink?">
          <span ${VALIDATE_TRIGGER}="true" id="click-trigger">Click Trigger</span>
        </div>
      `));

      const $drink = $form.find('#drink');
      const $clickTrigger = $form.find('#click-trigger');
      validator($form[0]);
      return { $drink, $clickTrigger };
    };

    it('should error when the value is empty', () => {
      const { $drink, $clickTrigger } = setupNotEmpty();
      $clickTrigger.trigger('click');
      expect($drink.is(':invalid')).to.be.true;
    });

    it('should submit when value is not empty', () => {
      const { $drink, $clickTrigger } = setupNotEmpty();
      $drink.val('white russian');
      $clickTrigger.trigger('click');
      expect($drink.is(':invalid')).to.be.false;
    });
  });

  describe('when validating a not validator', () => {
    const setupNot = () => {
      const notValue = 'tub';
      const $form = $(fixture.set(`
        <div>
          <label for="dude">He peed on the dude's:</label>
          <input id="dude" name="dude" type="text" data-validate-not="${notValue}">
          <span ${VALIDATE_TRIGGER}="true" id="click-trigger">Click Trigger</span>
        </div>
      `));

      const $dude = $form.find('#dude');
      const $clickTrigger = $form.find('#click-trigger');
      validator($form[0]);
      return { $dude, $clickTrigger, notValue };
    };

    it('should error when a field value is the provided value', () => {
      const { notValue, $dude, $clickTrigger } = setupNot();
      $dude.val(notValue);
      $clickTrigger.trigger('click');
      expect($dude.is(':invalid')).to.be.true;
    });

    it('should submit when a value is not the provided value', () => {
      const { $dude, $clickTrigger } = setupNot();
      $dude.val('rug');
      $clickTrigger.trigger('click');
      expect($dude.is(':invalid')).to.be.false;
    });
  });
});
