import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    const userProfile = await this.usersService.getUserById(user.id);
    if (!userProfile) {
      throw new Error('User not found');
    }
    return userProfile;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
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
  @UseGuards(JwtAuthGuard)
  async getBalance(@CurrentUser() user: any): Promise<BalanceResponseDto> {
    const balance = await this.usersService.getUserBalance(user.id);
    return { balance: balance.balance, userId: user.id };
  }
}
