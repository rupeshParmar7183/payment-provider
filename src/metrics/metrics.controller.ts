import {
  Controller,
  Get,
    UseGuards,
} from '@nestjs/common';

import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}