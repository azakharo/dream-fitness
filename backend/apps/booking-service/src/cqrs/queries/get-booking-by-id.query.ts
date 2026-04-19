export class GetBookingByIdQuery {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
  ) {}
}
