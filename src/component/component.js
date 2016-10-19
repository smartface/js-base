/**
 * Created by smartface on 10/18/16.
 */

const extend            = require("../core/extend");
const AbstractComponent = require("../core/abstract-component");

const MockAbstractComponent = function () {
};

const mockComponent = extend(MockAbstractComponent);

/**
 * Creates Component inheritance ready function, when class
 *
 * @returns {Function}
 */
const component = extend(AbstractComponent);

module.exports = {
  MockAbstractComponent: MockAbstractComponent,
  mockComponent: mockComponent,
  component: component
};