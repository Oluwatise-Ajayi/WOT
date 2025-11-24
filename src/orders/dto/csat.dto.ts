import { IsInt, IsString, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CsatDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  csat_score: number;

  @ApiProperty({ example: 'Great service!', required: false })
  @IsString()
  @IsOptional()
  csat_comment?: string;
}
