// Re-export filter DTOs from contracts for backward compatibility
export { BookingFilterDto, WaitlistFilterDto } from '@app/contracts/booking';
export {
  TrainingFilterDto,
  TrainerFilterDto,
  ScheduleFilterDto,
} from '@app/contracts/training';
export { NotificationFilterDto } from '@app/contracts/notification';
export { TransactionFilterDto } from '@app/contracts/auth';
