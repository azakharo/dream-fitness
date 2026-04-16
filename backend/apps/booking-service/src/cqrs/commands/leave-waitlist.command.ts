export class LeaveWaitlistCommand {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {}
}
