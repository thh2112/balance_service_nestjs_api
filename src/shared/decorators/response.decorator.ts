import { SetMetadata } from '@nestjs/common';

export const ResponseMessageKey = 'ResponseMessageKey';
export const ResponseInfo = (message: string = null) => SetMetadata(ResponseMessageKey, message);
