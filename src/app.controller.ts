import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/1')
  queue1() {
    return this.appService.addQueue1();
  }

  @Get('/2')
  queue2() {
    return this.appService.addQueue2();
  }
}
