import { Controller, Post, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response } from '@/commons/interfaces';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('/token')
  postData(@Req() request: Request): Promise<Response> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if(!token) {
        return Promise.resolve({
            success: false,
            message: "No token provided",
            data: {}
        });
    }
    return this.authenticationService.tokenCreate(token);
  }

  @Post('/verifyToken')
  verifyToken(@Req() request: Request): Promise<Response> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if(!token) {
        return Promise.resolve({
            success: false,
            message: "No token provided",
            data: {}
        });
    }
    return this.authenticationService.tokenVerify(token);
  }
}
