import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Define interface for authenticated requests
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      return this.authService.login(user);
    } catch (_error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('validate-token')
  async validateToken(@Body() tokenDto: { token: string }) {
    return this.authService.validateToken(tokenDto.token);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: { email: string }) {
    return this.authService.forgotPassword(emailDto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() resetDto: { token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(resetDto.token, resetDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() passwordDto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.id,
      passwordDto.currentPassword,
      passwordDto.newPassword,
    );
  }
}
