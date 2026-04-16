export class BookTrainingCommand {
  constructor(
    public readonly userId: string,
    public readonly trainingId: string,
  ) {}
}
