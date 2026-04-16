export class GetWaitlistPositionQuery {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {}
}
