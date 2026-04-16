export class CancelBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly reason?: string,
  ) {}
}
