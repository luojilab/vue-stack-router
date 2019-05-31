import { expect } from 'chai';
import EventEmitter from '../../src/lib/EventEmitter';
describe('src/lib/EventEmitter.ts', () => {
  it('Event should be ok', done => {
    const event = new EventEmitter();
    event.on('test', done);
    event.emit('test');
  });

  it('Paramter should be ok', done => {
    const event = new EventEmitter();
    event.on('test', (a: string, b: string) => {
      expect(a).to.eq('a');
      expect(b).to.eq('b');
      done();
    });
    event.emit('test', 'a', 'b');
  });

  it('off should be ok', done => {
    const event = new EventEmitter();
    const handler = (a: string, b: string) => {
      expect(a).to.eq('a');
      expect(b).to.eq('b');
      done();
    };
    event.on('test', handler);
    event.emit('test', 'a', 'b');
    event.off('test', handler);
    event.emit('test', 'a', 'b');
  });
});
