import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const welcomeResponse = { message: 'Welcome to Smart Support System Api', data: [] };

describe('AppService', () => {
  it('root returns welcome ApiResponse', () => {
    expect(new AppService().root()).toEqual(welcomeResponse);
  });
});

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = module.get(AppController);
  });

  it('GET / delegates to AppService and returns welcome response', () => {
    expect(controller.root()).toEqual(welcomeResponse);
  });
});
