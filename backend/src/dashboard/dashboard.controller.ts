import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit', ParseIntPipe) limit?: number) {
    return this.dashboardService.getRecentOrders(limit || 10);
  }

  @Get('top-products')
  getTopProducts(@Query('limit', ParseIntPipe) limit?: number) {
    return this.dashboardService.getTopProducts(limit || 5);
  }

  @Get('orders-by-status')
  getOrdersByStatus() {
    return this.dashboardService.getOrdersByStatus();
  }

  @Get('revenue-chart')
  getRevenueChart(@Query('days', ParseIntPipe) days?: number) {
    return this.dashboardService.getRevenueChart(days || 30);
  }
}
