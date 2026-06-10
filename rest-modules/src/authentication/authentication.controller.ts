import { Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response } from '@/commons/interfaces';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('/token')
  postData(@Req() request: Request): Promise<Response> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return Promise.resolve({
        success: false,
        message: "No token provided",
        data: {}
      });
    }
    return this.authenticationService.tokenCreate(token);
  }

  @Post('/verifyToken')
  async verifyToken(@Req() request: Request): Promise<Response> {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new ForbiddenException("No token provided");

    const result = await this.authenticationService.tokenVerify(token);
    if (!result.success) throw new ForbiddenException(result.message);
    return result;
  }
}
