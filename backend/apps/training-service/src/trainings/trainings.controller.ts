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
  ApiBody,
} from '@nestjs/swagger';
import { InternalGuard } from '@app/shared';
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
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Create a new training' })
  @ApiCreatedResponse({ type: TrainingResponseDto })
  @ApiBody({ type: CreateTrainingDto })
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingResponseDto> {
    return this.trainingsService.create(createTrainingDto);
  }

  @Get()
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get list of trainings with filters' })
  @ApiOkResponse({ type: [TrainingResponseDto] })
  async findAll(
    @Query() filterDto: TrainingFilterDto,
  ): Promise<{ data: TrainingResponseDto[]; total: number }> {
    return this.trainingsService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Get training by ID' })
  @ApiOkResponse({ type: TrainingResponseDto })
  async findOne(@Param('id') id: string): Promise<TrainingResponseDto> {
    return this.trainingsService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Update training' })
  @ApiOkResponse({ type: TrainingResponseDto })
  @ApiBody({ type: UpdateTrainingDto })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingResponseDto> {
    return this.trainingsService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalGuard)
  @ApiOperation({ summary: 'Cancel training' })
  @ApiOkResponse({ description: 'Training cancelled successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.trainingsService.remove(id);
  }

  @Get(':id/availability')
  @UseGuards(InternalGuard)
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
