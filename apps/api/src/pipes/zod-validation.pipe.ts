import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      console.log('Validating value:', JSON.stringify(value, null, 2));
      const parsedValue = this.schema.parse(value);
      console.log('Validation successful:', JSON.stringify(parsedValue, null, 2));
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Zod validation error:', JSON.stringify(error.issues, null, 2));
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      console.error('Unknown validation error:', error);
      throw new BadRequestException('Validation failed');
    }
  }
}
