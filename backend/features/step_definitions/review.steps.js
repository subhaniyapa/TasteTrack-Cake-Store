import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { reviewSchema } from '../../validators/schemas.js';

Given('the user provides a rating of {int}', function (rating) {
  this.rating = rating;
});

When('the review is validated', function () {
  this.result = reviewSchema.validate({
    rating: this.rating
  });
});

Then('the review should be accepted', function () {
  assert.equal(this.result.error, undefined);
});

Then('the review should be rejected', function () {
  assert.ok(this.result.error);
});