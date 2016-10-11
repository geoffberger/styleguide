import $ from 'jquery';

import './modules.scss';
import './accordion';
import './product-size-style';
import './product-delivery-update';
import './product-added-confirmation';
import './product-color-change';

$(document).ready(() => {
  $('.js-accordion').accordion();
  $('.product-option--size .product-option__select').sizeStyle();
  $('.product-delivery').deliveryUpdate();
  $('.product-option--color .product-option__select').colorChange();
  $('.btn--add-to-bag').addedConfirmation();
});
