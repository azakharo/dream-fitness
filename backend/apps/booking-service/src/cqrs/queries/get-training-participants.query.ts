export class GetTrainingParticipantsQuery {
  constructor(
    public readonly trainingId: string,
    public readonly userId: string,
    public readonly userRole: string,
  ) {}
}
