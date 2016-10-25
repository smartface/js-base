/**
 * Created by smartface on 10/18/16.
 */

const extend            = require("../core/extend");
const AbstractComponent = require("../core/abstract-component");
const SMFx = require("../infrastructure/smfx");

const SMFMockUIComponent  = function () {
};

const MockAbstractComponent = function () {
  this.getEventStream = function () {
    return "stream";
  };
};

const mockComponent = extend(MockAbstractComponent);

mockComponent.prototype.touch = function () {
};

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