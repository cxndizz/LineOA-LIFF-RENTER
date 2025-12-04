import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get counts
    const totalProducts = await this.prisma.product.count();
    const totalBranches = await this.prisma.branch.count({
      where: { isActive: true },
    });
    const totalCustomers = await this.prisma.customer.count();

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await this.prisma.rentalOrder.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get this month's orders
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthOrders = await this.prisma.rentalOrder.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lt: firstDayOfNextMonth,
        },
      },
    });

    // Get active rentals (IN_USE status)
    const activeRentals = await this.prisma.rentalOrder.count({
      where: {
        status: 'IN_USE',
      },
    });

    // Calculate total revenue (APPROVED, IN_USE, RETURNED)
    const revenueOrders = await this.prisma.rentalOrder.findMany({
      where: {
        status: {
          in: ['APPROVED', 'IN_USE', 'RETURNED'],
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const totalRevenue = revenueOrders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );

    // Calculate this month's revenue
    const monthRevenueOrders = await this.prisma.rentalOrder.findMany({
      where: {
        status: {
          in: ['APPROVED', 'IN_USE', 'RETURNED'],
        },
        createdAt: {
          gte: firstDayOfMonth,
          lt: firstDayOfNextMonth,
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const monthRevenue = monthRevenueOrders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );

    return {
      totalProducts,
      totalBranches,
      totalCustomers,
      todayOrders,
      monthOrders,
      activeRentals,
      totalRevenue,
      monthRevenue,
    };
  }

  async getRecentOrders(limit: number = 10) {
    return this.prisma.rentalOrder.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        product: {
          include: {
            images: {
              where: {
                isMain: true,
              },
              take: 1,
            },
          },
        },
        branch: true,
      },
    });
  }

  async getTopProducts(limit: number = 5) {
    const products = await this.prisma.product.findMany({
      include: {
        rentals: {
          where: {
            status: {
              in: ['APPROVED', 'IN_USE', 'RETURNED'],
            },
          },
        },
        images: {
          where: {
            isMain: true,
          },
          take: 1,
        },
      },
    });

    // Sort by rental count
    const productsWithCount = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        rentalCount: product.rentals.length,
        totalRevenue: product.rentals.reduce(
          (sum, rental) => sum + Number(rental.totalPrice),
          0
        ),
        image: product.images[0]?.url || null,
      }))
      .sort((a, b) => b.rentalCount - a.rentalCount)
      .slice(0, limit);

    return productsWithCount;
  }

  async getOrdersByStatus() {
    const statuses = [
      'PENDING_PAYMENT',
      'WAITING_CONFIRMATION',
      'APPROVED',
      'WAITING_DELIVERY',
      'IN_USE',
      'RETURNED',
      'CANCELLED',
      'REJECTED',
    ];

    const counts = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prisma.rentalOrder.count({
          where: { status: status as any },
        });
        return { status, count };
      })
    );

    return counts;
  }

  async getRevenueChart(days: number = 30) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.rentalOrder.findMany({
      where: {
        status: {
          in: ['APPROVED', 'IN_USE', 'RETURNED'],
        },
        createdAt: {
          gte: startDate,
          lte: today,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const revenueByDate = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      if (!acc[dateStr]) {
        acc[dateStr] = 0;
      }
      acc[dateStr] += Number(order.totalPrice);

      return acc;
    }, {} as Record<string, number>);

    // Convert to array format
    const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return chartData;
  }
}
