import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IUpdateTaskBody } from './task.dto.interfaces';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { HttpApiResponse } from '../../../../core/CoreApiResponse';
import { ITask } from '../../../interfaces/schemas.interface';
import { taskExample } from './create-task.dto';
export class UpdateTaskBody implements IUpdateTaskBody {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_solved?: boolean;

  @ApiProperty({ example: 'do the housework', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: '06:30:00 1/11/2023', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_time?: Date;

  @ApiProperty({ example: 1800000, description: 'time in ms', required: false })
  @IsOptional()
  @Min(60000)
  @IsNumber()
  @Type(() => Number)
  duration?: number;

  @ApiProperty({ example: 'mop the floor, do laundry', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @MinLength(3)
  description?: string;
}

export class UpdateTaskRes extends HttpApiResponse {
  @ApiProperty({ example: 'task_update_success' })
  public message: string;

  @ApiProperty({
    example: {
      ...taskExample,
      updated_at: '06:38:22 1/11/2023',
    },
  })
  public data: ITask;
}
