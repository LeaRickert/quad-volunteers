import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    // Loads apps/api/.env into process.env and makes ConfigService injectable everywhere.
    ConfigModule.forRoot({ isGlobal: true }),
    // forRootAsync lets the connection options depend on another provider (ConfigService).
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        // Entities registered via TypeOrmModule.forFeature() are picked up automatically.
        autoLoadEntities: true,
        // Dev only: creates/alters tables to match entities. Replace with migrations later.
        synchronize: true,
      }),
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
