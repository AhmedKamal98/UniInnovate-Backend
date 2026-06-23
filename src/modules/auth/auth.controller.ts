import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { RequestUser } from '../../common/types';
import { LoginDto, RefreshDto, SwitchRoleDto, ImpersonateDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  async logout() {
    // In a production system, blacklist the refresh token in Redis
    return;
  }

  @Post('switch-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch active role' })
  async switchRole(@CurrentUser() user: RequestUser, @Body() dto: SwitchRoleDto) {
    return this.authService.switchRole(user.id, dto.role);
  }

  @Post('impersonate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Impersonate another user (super-admin only)' })
  async impersonate(@CurrentUser() user: RequestUser, @Body() dto: ImpersonateDto) {
    return this.authService.impersonate(user.id, dto.userId, dto.role);
  }

  @Post('stop-impersonation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop impersonation, restore original session' })
  async stopImpersonation(@CurrentUser() user: RequestUser) {
    if (!user.impersonatedBy) {
      return { message: 'Not currently impersonating' };
    }
    return this.authService.stopImpersonation(user.impersonatedBy);
  }
}
