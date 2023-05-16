import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { BasicAuthMiddleware } from './basic-auth.middleware';
import {
  InjectQueue1,
  QUEUE_1_QUEUE_NAME,
  Queue1Queue,
} from './queue-1.processor';
import {
  InjectQueue2,
  QUEUE_2_QUEUE_NAME,
  Queue2Queue,
} from './queue-2.processor';

type RegisteredModule = DynamicModule &
  Required<Pick<DynamicModule, 'exports' | 'providers'>>;

function assertModuleIsRegistered(
  module: DynamicModule,
): module is RegisteredModule {
  return Array.isArray(module.providers) && Array.isArray(module.exports);
}

@Module({})
export class QueuesModule implements NestModule {
  static register(): DynamicModule {
    function registerQueue(name: string) {
      const queue = BullModule.registerQueue({ name });

      if (!assertModuleIsRegistered(queue)) {
        throw new Error(`Unable to register queue ${name}`);
      }

      return queue;
    }

    const queue1 = registerQueue(QUEUE_1_QUEUE_NAME);
    const queue2 = registerQueue(QUEUE_2_QUEUE_NAME);

    return {
      module: QueuesModule,
      imports: [
        HttpModule.register({}),
        BullModule.forRoot({
          connection: {
            host: 'localhost',
            port: 15610,
          },
        }),
        queue1,
        queue2,
      ],
      providers: [
        BasicAuthMiddleware,
        ...queue1.providers,
        ...queue2.providers,
      ],
      exports: [...queue1.exports, ...queue2.exports],
    };
  }

  constructor(
    @InjectQueue1()
    private readonly queue1: Queue1Queue,
    @InjectQueue2()
    private readonly queue2: Queue2Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const adminPath = '/queues';
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(adminPath);

    createBullBoard({
      queues: [new BullMQAdapter(this.queue1), new BullMQAdapter(this.queue2)],
      serverAdapter,
    });

    consumer
      .apply(BasicAuthMiddleware, serverAdapter.getRouter())
      .forRoutes(adminPath);
  }
}
