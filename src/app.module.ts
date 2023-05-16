import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [QueuesModule.register(), ScheduleModule.forRoot()],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
