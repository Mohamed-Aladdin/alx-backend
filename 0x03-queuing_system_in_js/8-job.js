import { Queue, Job } from 'kue';

export default function createPushNotificationsJobs(jobs, queue) {
  if (!(jobs instanceof Array)) {
    throw new Error('Jobs is not an array');
  }

  jobs.forEach((item) => {
    const job = queue.create('push_notification_code_3');

    job
      .on('enqueue', () => {
        console.log('Notification job created:', job.id);
      })
      .on('complete', () => {
        console.log('Notification job', job.id, 'completed');
      })
      .on('failed', (err) => {
        console.log(
          'Notification job',
          job.id,
          'failed:',
          err.message.toString()
        );
      })
      .on('progress', (progress, _data) => {
        console.log('Notification job', job.id, `${progress}% complete`);
      });

    job.save();
  });
}
