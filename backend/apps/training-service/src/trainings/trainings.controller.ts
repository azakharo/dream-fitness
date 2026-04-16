import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { JwtAuthGuard } from '@app/shared';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingResponseDto } from '@app/contracts';
import { TrainingFilterDto } from './dto/training-filter.dto';

@ApiTags('trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiCreatedResponse({ type: TrainingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateTrainingDto })
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingResponseDto> {
    return this.trainingsService.create(createTrainingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of trainings with filters' })
  @ApiOkResponse({ type: [TrainingResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @Query() filterDto: TrainingFilterDto,
  ): Promise<{ data: TrainingResponseDto[]; total: number }> {
    return this.trainingsService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get training by ID' })
  @ApiOkResponse({ type: TrainingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<TrainingResponseDto> {
    return this.trainingsService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update training' })
  @ApiOkResponse({ type: TrainingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: UpdateTrainingDto })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingResponseDto> {
    return this.trainingsService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel training' })
  @ApiOkResponse({ description: 'Training cancelled successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.trainingsService.remove(id);
  }

  @Get(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check available slots for training' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        trainingId: { type: 'string' },
        capacity: { type: 'number' },
        currentParticipants: { type: 'number' },
        availableSlots: { type: 'number' },
        isAvailable: { type: 'boolean' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAvailability(@Param('id') id: string): Promise<{
    trainingId: string;
    capacity: number;
    currentParticipants: number;
    availableSlots: number;
    isAvailable: boolean;
  }> {
    return this.trainingsService.getAvailability(id);
  }
}
