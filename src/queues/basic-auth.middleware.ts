import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  private base64EncodedCredentials: string;

  constructor() {
    this.base64EncodedCredentials = Buffer.from('user' + ':' + 'pass').toString(
      'base64',
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCreds || reqCreds !== this.base64EncodedCredentials) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Auth", charset="UTF-8"');
      res.sendStatus(401);
    } else {
      next();
    }
  }
}
