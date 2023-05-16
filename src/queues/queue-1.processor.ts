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

export type Queue1Queue = Queue<JobData, boolean>;
export type Queue1Job = Job<JobData, boolean>;

export const QUEUE_1_QUEUE_NAME = 'queue-1';
export const InjectQueue1 = (): ParameterDecorator =>
  InjectQueue(QUEUE_1_QUEUE_NAME);

@Processor(QUEUE_1_QUEUE_NAME, {
  concurrency: 5,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
})
export class Queue1Processor extends WorkerHost {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async process(job: Queue1Job) {
    job.log(`Received job in queue 1`);
    job.log('Finished');
    job.updateProgress(100);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Queue1Job) {
    console.log(`Queue1 job completed ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Queue1Job) {
    console.log(`Queue1 job failed ${job.id}`);
  }
}
