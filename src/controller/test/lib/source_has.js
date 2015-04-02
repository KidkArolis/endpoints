const expect = require('chai').expect;

const sourceHas = require('../../lib/source_has');

describe('sourceHas', () => {
  it('should return undefined if there "request" argument', () => {
    expect(sourceHas([1], null, 'number')).to.be.undefined;
  });

  it('should return an empty array if the members of the requested array is in the array', () => {
    expect(sourceHas([1], [1], 'number')).to.be.an('array');
  });

  it('should return null if the requested item is an existing object property', () => {
    expect(sourceHas({'1':'a'}, '1', 'property')).to.be.null;
  });

  it('should return an error message if the requested item is not in the array', () => {
    expect(sourceHas([1], [2], 'number')).to.match(/Model does not have/);
    expect(sourceHas({'1':'a'}, '2', 'property')).to.match(/Model does not have/);
  });
});