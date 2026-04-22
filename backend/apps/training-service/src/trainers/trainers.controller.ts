import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InternalGuard } from '@app/shared';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { TrainerResponseDto } from './dto/trainer-response.dto';
import { TrainerNotFoundException } from '../common/exceptions';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new trainer' })
  @ApiCreatedResponse({ type: TrainerResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateTrainerDto })
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.create(createTrainerDto);
  }

  @Get()
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of active trainers' })
  @ApiOkResponse({ type: [TrainerResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(): Promise<TrainerResponseDto[]> {
    return this.trainersService.findActive();
  }

  @Get(':id')
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trainer by ID' })
  @ApiOkResponse({ type: TrainerResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<TrainerResponseDto> {
    const trainer = await this.trainersService.findById(id);
    if (!trainer) {
      throw new TrainerNotFoundException(id);
    }
    return trainer;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trainer' })
  @ApiOkResponse({ type: TrainerResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: UpdateTrainerDto })
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate trainer' })
  @ApiOkResponse({ description: 'Trainer deactivated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.trainersService.remove(id);
  }
}
