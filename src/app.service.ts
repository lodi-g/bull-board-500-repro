import { Injectable, Logger } from '@nestjs/common';

import { InjectQueue1, Queue1Queue } from './queues/queue-1.processor';
import { InjectQueue2, Queue2Queue } from './queues/queue-2.processor';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectQueue1()
    private readonly queue1: Queue1Queue,
    @InjectQueue2()
    private readonly queue2: Queue2Queue,
  ) {}

  async addQueue1() {
    this.queue1.add('queue1job', { id: 'id' });
    return 'OK';
  }

  async addQueue2() {
    this.queue2.add('queue2job', { id: 'id' });
    return 'OK';
  }
}
