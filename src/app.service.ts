import { Injectable } from '@nestjs/common';
import { sendResponse } from './utils/responses.dto';

@Injectable()
export class AppService {
  root = () => sendResponse('Welcome to Smart Support System Api', []);
}
