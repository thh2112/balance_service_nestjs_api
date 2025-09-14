import { HttpStatus } from '@nestjs/common';
import { OperationResult } from '../interfaces';

export const generateInternalServerResult = (message?: string): OperationResult => ({
  success: false,
  message: message || 'common.server_error',
  httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
});

export const generateNotFoundResult = (message: string): OperationResult => ({
  success: false,
  message,
  httpCode: HttpStatus.NOT_FOUND,
});

export const generateBadRequestResult = (message: string): OperationResult => ({
  success: false,
  message,
  httpCode: HttpStatus.BAD_REQUEST,
});

export const generateConflictResult = (message: string): OperationResult => ({
  success: false,
  message,
  httpCode: HttpStatus.CONFLICT,
});

export const generateUnprocessableEntityResult = (message: string): OperationResult => ({
  success: false,
  message,
  httpCode: HttpStatus.UNPROCESSABLE_ENTITY,
});

export const generateUnauthorizedResult = (message: string): OperationResult => ({
  success: false,
  message,
  httpCode: HttpStatus.UNAUTHORIZED,
});

export const generateEmptyPaginationResult = (): OperationResult => ({
  success: true,
  data: { rows: [], total: 0 },
});
