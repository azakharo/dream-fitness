import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { InternalUser } from '@app/shared';
import { InternalGuard } from '@app/shared';
import { UsersService } from './users.service';
import {
  UserResponseDto,
  FindAllUsersQueryDto,
  UpdateUserStatusDto,
  UserListResponseDto,
} from '@app/contracts';
import { BalanceResponseDto } from './dto/balance-response.dto';
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
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  async getProfile(@InternalUser() user: AuthUser): Promise<UserResponseDto> {
    const userProfile = await this.usersService.getUserById(user.id);
    if (!userProfile) {
      throw new NotFoundException('User not found');
    }
    return userProfile;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
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
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  @Get('balance')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get user balance' })
  @ApiOkResponse({ type: BalanceResponseDto })
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

  @Get('users')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiOkResponse({ type: UserListResponseDto })
  async findAll(
    @Query() query: FindAllUsersQueryDto,
  ): Promise<UserListResponseDto> {
    const result = await this.usersService.findAll(query);
    return {
      items: result.users,
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  @Get('users/:id')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get user details by ID (admin only)' })
  @ApiOkResponse({ type: UserResponseDto })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Block/unblock user (admin only)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateStatus(
      id,
      updateStatusDto.status,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
