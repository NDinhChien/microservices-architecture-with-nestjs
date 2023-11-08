import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../core/CoreApiResponse';
import { ITask } from '../../../interfaces/schemas.interface';
import { taskExample } from './create-task.dto';

export class GetTaskRes extends HttpApiResponse {
  @ApiProperty({ example: 'task_get_success' })
  public message: string;

  @ApiProperty({ example: taskExample })
  public data: ITask;
}
