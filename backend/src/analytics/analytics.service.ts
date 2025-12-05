import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = dayjs().startOf('day').toDate();
    const endOfToday = dayjs().endOf('day').toDate();

    // Parallel queries for better performance
    const [
      todayOrders,
      totalProducts,
      activeBranches,
      totalRevenue,
      activeRentals,
      topProducts,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      // Today's Orders Count
      this.prisma.rentalOrder.count({
        where: {
          createdAt: {
            gte: today,
            lte: endOfToday,
          },
        },
      }),

      // Total Products Count
      this.prisma.product.count(),

      // Active Branches Count
      this.prisma.branch.count({
        where: { isActive: true },
      }),

      // Total Revenue (All completed orders)
      this.prisma.rentalOrder.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: 'RETURNED', // Only count completed rentals
        },
      }),

      // Active Rentals (Currently in use)
      this.prisma.rentalOrder.count({
        where: {
          status: {
            in: ['APPROVED', 'WAITING_DELIVERY', 'IN_USE'],
          },
        },
      }),

      // Top 5 Most Rented Products
      this.prisma.product.findMany({
        include: {
          _count: {
            select: { rentals: true },
          },
          branch: true,
        },
        orderBy: {
          rentals: {
            _count: 'desc',
          },
        },
        take: 5,
      }),

      // Total Customers
      this.prisma.customer.count(),

      // Recent Orders (Last 5)
      this.prisma.rentalOrder.findMany({
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Revenue Trend (Last 7 days)
    const revenueTrend = await this.getRevenueTrend(7);

    // Status Distribution
    const statusDistribution = await this.prisma.rentalOrder.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      summary: {
        todayOrders,
        totalProducts,
        activeBranches,
        activeRentals,
        totalCustomers,
        totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      },
      topProducts: topProducts.map((product) => ({
        id: product.id,
        name: product.name,
        branchName: product.branch.name,
        rentalCount: product._count.rentals,
        pricePerDay: Number(product.pricePerDay),
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        rentalRef: order.rentalRef,
        customerName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.displayName,
        productName: order.product.name,
        totalPrice: Number(order.totalPrice),
        status: order.status,
        createdAt: order.createdAt,
      })),
      revenueTrend,
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  private async getRevenueTrend(days: number) {
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      const revenue = await this.prisma.rentalOrder.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            notIn: ['CANCELLED', 'REJECTED'],
          },
        },
      });

      trend.push({
        date: date.format('DD/MM'),
        revenue: Number(revenue._sum.totalPrice || 0),
      });
    }
    return trend;
  }
}
