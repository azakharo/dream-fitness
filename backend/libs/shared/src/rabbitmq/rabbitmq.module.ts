import {
  Module,
  DynamicModule,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { RabbitMQModule as GolevelupModule } from '@golevelup/nestjs-rabbitmq';

export interface RabbitMQModuleOptions {
  enableRPC?: boolean;
  enablePubSub?: boolean;
  exchanges?: string[];
}

@Module({})
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions = {}): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [GolevelupModule.forRoot(RabbitMQModule.createOptions(options))],
      exports: [GolevelupModule],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: unknown[]
    ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
    inject?: (InjectionToken | OptionalFactoryDependency)[];
  }): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        GolevelupModule.forRootAsync({
          useFactory: async (...args: unknown[]) => {
            const config = await options.useFactory(...args);
            return RabbitMQModule.createOptions(config);
          },
          inject: options.inject || [],
        }),
      ],
      exports: [GolevelupModule],
    };
  }

  static forService(): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [GolevelupModule.forRoot(RabbitMQModule.createOptions({}))],
      exports: [GolevelupModule],
    };
  }

  private static createOptions(options: RabbitMQModuleOptions) {
    const exchanges = options.exchanges || ['dreamfitness.exchange'];

    return {
      exchanges: exchanges.map((name) => ({
        name,
        type: 'topic',
        options: { durable: true },
      })),
      uri:
        process.env.RABBITMQ_URL ||
        'amqp://dreamfitness:dreamfitness123@localhost:5672',
      connectionInitOptions: { timeout: 30000 },
      defaultRpcTimeout: 10000,
      enableDirectReplyTo: options.enableRPC ?? true,
    };
  }
}
