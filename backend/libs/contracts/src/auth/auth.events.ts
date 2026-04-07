export interface UserCreatedEvent {
  eventType: 'user.created';
  data: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface BalanceChangedEvent {
  eventType: 'user.balance_changed';
  data: {
    userId: string;
    oldBalance: number;
    newBalance: number;
    amount: number;
    description?: string;
  };
}
