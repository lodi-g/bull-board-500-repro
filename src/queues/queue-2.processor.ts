import { HttpService } from '@nestjs/axios';
import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job, Queue } from 'bullmq';

type JobData = {
  id: string;
};

export type Queue2Queue = Queue<JobData, boolean>;
export type Queue2Job = Job<JobData, boolean>;

export const QUEUE_2_QUEUE_NAME = 'queue-2';
export const InjectQueue2 = (): ParameterDecorator =>
  InjectQueue(QUEUE_2_QUEUE_NAME);

@Processor(QUEUE_2_QUEUE_NAME, {
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
})
export class Queue2Processor extends WorkerHost {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async process(job: Queue2Job) {
    job.log(`Received job in queue 2`);
    job.log('Finished');
    job.updateProgress(100);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Queue2Job) {
    console.log(`Queue2 job completed ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Queue2Job) {
    console.log(`Queue2 job failed ${job.id}`);
  }
}
