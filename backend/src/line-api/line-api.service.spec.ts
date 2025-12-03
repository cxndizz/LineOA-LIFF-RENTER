import { Test, TestingModule } from '@nestjs/testing';
import { LineApiService } from './line-api.service';

describe('LineApiService', () => {
  let service: LineApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineApiService],
    }).compile();

    service = module.get<LineApiService>(LineApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
