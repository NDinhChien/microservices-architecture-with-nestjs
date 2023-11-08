import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ICreateTaskBody } from './task.dto.interfaces';
import { Type } from 'class-transformer';
import { HttpApiResponse } from '../../../../core/CoreApiResponse';
import { ApiProperty } from '@nestjs/swagger';
import { ITask } from '../../../interfaces/schemas.interface';

export const taskExample = {
  _id: 'aaabbbcccdddeeefff',
  user_id: 'ggghhhiiikkklllmmm',
  is_solved: false,
  name: 'do the housework',
  start_time: '06:05:55 1/11/2023',
  duration: '1800000',
  description: 'mop the floor, do laundry',
  created_at: '06:05:55 1/11/2023',
  updated_at: '06:05:55 1/11/2023',
};

export class CreateTaskBody implements ICreateTaskBody {
  @ApiProperty({ example: 'do the housework' })
  @MaxLength(100)
  @MinLength(3)
  @IsString()
  name: string;

  @ApiProperty({ example: '06:30:00 1/11/2023' })
  @IsDate()
  @Type(() => Date)
  start_time: Date;

  @ApiProperty({ example: 1800000, description: 'time in ms' })
  @Min(60000)
  @IsNumber()
  @Type(() => Number)
  duration: number;

  @ApiProperty({ example: 'mop the floor, do laundry', required: false })
  @IsOptional()
  @MaxLength(200)
  @MinLength(3)
  @IsString()
  description?: string;
}

export class CreateTaskRes extends HttpApiResponse {
  @ApiProperty({ example: 'task_create_success' })
  public message: string;

  @ApiProperty({
    example: taskExample,
  })
  public data: ITask;
}
