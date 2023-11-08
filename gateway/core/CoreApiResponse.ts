import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger';

export class CoreApiResponse<TData> {
  
  public readonly status: number;

  public readonly message: string;

  public readonly timestamp: string;

  public data: TData;

  private constructor(status: number, message: string, data: TData) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toLocaleString();
  }

  public static new<TData>(
    status: number,
    message: string,
    data: TData,
  ): CoreApiResponse<TData> {
    const resultStatus: number = status ;
    const resultMessage = message;
    return new CoreApiResponse(resultStatus, resultMessage, data);
  }
}


export class HttpApiResponse {

  @ApiProperty({example: 200})
  public status: number;

  @ApiProperty({example: 'OK'})
  public message: string;

  @ApiProperty({example: '9:30:15 1/11/2023'})
  public timestamp: string;

  @ApiProperty({example: null})
  public data: any;

}