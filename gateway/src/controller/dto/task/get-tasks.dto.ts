import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../core/CoreApiResponse';
import { ITask } from '../../../interfaces/schemas.interface';
import { taskExample } from './create-task.dto';

export class TaskList extends HttpApiResponse {
  @ApiProperty({ example: 'tasks_get_success' })
  public message: string;

  @ApiProperty({ isArray: true, example: [taskExample] })
  public data: ITask[];
}
