import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InternalUser } from '@app/shared';
import { InternalGuard } from '@app/shared';
import { UsersService } from './users.service';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthUser {
  id: string;
  role: string;
}

@ApiTags('Users')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(
    @InternalUser() user: AuthUser,
  ): Promise<UserResponseDto> {
    const userProfile = await this.usersService.getUserById(user.id);
    if (!userProfile) {
      throw new Error('User not found');
    }
    return userProfile;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @InternalUser() user: AuthUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateUserProfile(
      user.id,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  @Get('balance')
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user balance' })
  @ApiOkResponse({ type: BalanceResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getBalance(
    @InternalUser() user: AuthUser,
  ): Promise<BalanceResponseDto> {
    const balance = await this.usersService.getUserBalance(user.id);
    return { balance: balance.balance, userId: user.id };
  }

  @Get('users/:id/email')
  @ApiOperation({ summary: 'Get user email by ID (internal endpoint)' })
  @ApiOkResponse({ description: 'Returns user email' })
  async getUserEmail(@Param('id') id: string): Promise<{ email: string }> {
    const email = await this.usersService.getUserEmailById(id);
    if (!email) {
      throw new NotFoundException('User not found');
    }
    return { email };
  }

  @Get('users/:id/name')
  @ApiOperation({ summary: 'Get user name by ID (internal endpoint)' })
  @ApiOkResponse({ description: 'Returns user name' })
  async getUserName(@Param('id') id: string): Promise<{ name: string }> {
    const name = await this.usersService.getUserNameById(id);
    if (!name) {
      throw new NotFoundException('User not found');
    }
    return { name };
  }
}
