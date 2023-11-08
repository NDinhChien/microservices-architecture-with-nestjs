import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../core/CoreApiResponse';
import { IsMongoId } from 'class-validator';

export const TaskIdParam = {
  name: 'id',
  type: 'String',
  example: 'aaabbbcccdddeeefff',
  required: true,
};

export class TaskId {
  @IsMongoId()
  id: string;
}

export class DeleteTaskRes extends HttpApiResponse {
  @ApiProperty({ example: 'task_delete_success' })
  public message: string;
}
