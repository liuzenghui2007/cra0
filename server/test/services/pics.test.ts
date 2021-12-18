import assert from 'assert';
import app from '../../src/app';

describe('\'pics\' service', () => {
  it('registered the service', () => {
    const service = app.service('pics');

    assert.ok(service, 'Registered the service');
  });
});
