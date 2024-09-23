import sinon from 'sinon';
import { expect } from 'chai';
import { createQueue } from 'kue';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  const spy = sinon.spy(console, 'log');
  const QUEUE = createQueue({ name: 'push_notification_code_test' });

  before(() => {
    QUEUE.testMode.enter(true);
  });

  after(() => {
    QUEUE.testMode.clear();
    QUEUE.testMode.exit();
  });

  afterEach(() => {
    spy.resetHistory();
  });

  it('displays an error message if jobs is not an array', () => {
    expect(
      createPushNotificationsJobs.bind(createPushNotificationsJobs, {}, QUEUE)
    ).to.throw('Jobs is not an array');
  });

  it('adding jobs to the queue', (done) => {
    expect(QUEUE.testMode.jobs.length).to.equal(0);

    const jobs = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account',
      },
      {
        phoneNumber: '4153518781',
        message: 'This is the code 4562 to verify your account',
      },
    ];

    createPushNotificationsJobs(jobs, QUEUE);
    expect(QUEUE.testMode.jobs.length).to.equal(2);
    expect(QUEUE.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(QUEUE.testMode.jobs[0].type).to.equal('push_notification_code_3');

    QUEUE.process('push_notification_code_3', () => {
      expect(
        spy.calledWith('Notification job created:', QUEUE.testMode.jobs[0].id)
      ).to.be.true;
      done();
    });
  });

  it('registering the progress event handler', (done) => {
    QUEUE.testMode.jobs[0].addListener('progress', () => {
      expect(
        spy.calledWith(
          'Notification job',
          QUEUE.testMode.jobs[0].id,
          '25% complete'
        )
      ).to.be.true;
      done();
    });
    QUEUE.testMode.jobs[0].emit('progress', 25);
  });

  it('registering the failed event handler', (done) => {
    QUEUE.testMode.jobs[0].addListener('failed', () => {
      expect(
        spy.calledWith(
          'Notification job',
          QUEUE.testMode.jobs[0].id,
          'failed:',
          'Failed to send'
        )
      ).to.be.true;
      done();
    });
    QUEUE.testMode.jobs[0].emit('failed', new Error('Failed to send'));
  });

  it('registering the complete event handler', (done) => {
    QUEUE.testMode.jobs[0].addListener('complete', () => {
      expect(
        spy.calledWith(
          'Notification job',
          QUEUE.testMode.jobs[0].id,
          'completed'
        )
      ).to.be.true;
      done();
    });
    QUEUE.testMode.jobs[0].emit('complete');
  });
});
