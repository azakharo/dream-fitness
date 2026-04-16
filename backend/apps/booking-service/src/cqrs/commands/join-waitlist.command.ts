export class JoinWaitlistCommand {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {}
}
