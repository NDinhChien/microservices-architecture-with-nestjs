import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TaskServiceConfig } from './services/service.config';
import { TaskController } from './task.controller';
import { TaskService } from './services/task.service';
import { TaskSchema } from './schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forRoot(TaskServiceConfig.mongoUri),
    MongooseModule.forFeature([
      {
        name: 'Task',
        schema: TaskSchema,
        collection: 'tasks',
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
