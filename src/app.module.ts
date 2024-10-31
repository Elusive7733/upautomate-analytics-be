import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { databaseConfig } from './config/database.config';
import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        
        mongoose.connection.on('connected', () => {
          Logger.log('MongoDB Connected Successfully!', 'DatabaseModule');
        });

        return {
          uri,
          dbName: 'upautomation',
        };
      },
      inject: [ConfigService],
    }),
    AnalyticsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
