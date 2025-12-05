// File: src/customers/customers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all customers with their rental statistics
   */
  async findAll() {
    const customers = await this.prisma.customer.findMany({
      include: {
        rentals: {
          select: {
            id: true,
            rentalRef: true,
            status: true,
            totalPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics for each customer
    return customers.map((customer) => {
      const totalRentals = customer.rentals.length;
      const activeRentals = customer.rentals.filter((r) =>
        ['APPROVED', 'WAITING_DELIVERY', 'IN_USE'].includes(r.status)
      ).length;
      const completedRentals = customer.rentals.filter(
        (r) => r.status === 'RETURNED'
      ).length;
      const totalSpent = customer.rentals
        .filter((r) => r.status !== 'CANCELLED' && r.status !== 'REJECTED')
        .reduce((sum, rental) => sum + Number(rental.totalPrice), 0);

      const lastRental = customer.rentals[0] || null;

      return {
        id: customer.id,
        lineUserId: customer.lineUserId,
        displayName: customer.displayName,
        pictureUrl: customer.pictureUrl,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        statistics: {
          totalRentals,
          activeRentals,
          completedRentals,
          totalSpent,
        },
        lastRental: lastRental
          ? {
              rentalRef: lastRental.rentalRef,
              status: lastRental.status,
              createdAt: lastRental.createdAt,
            }
          : null,
      };
    });
  }

  /**
   * Get a single customer with detailed rental history
   */
  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        rentals: {
          include: {
            product: true,
            branch: true,
            payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      throw new Error(`Customer #${id} not found`);
    }

    const totalRentals = customer.rentals.length;
    const activeRentals = customer.rentals.filter((r) =>
      ['APPROVED', 'WAITING_DELIVERY', 'IN_USE'].includes(r.status)
    ).length;
    const completedRentals = customer.rentals.filter(
      (r) => r.status === 'RETURNED'
    ).length;
    const totalSpent = customer.rentals
      .filter((r) => r.status !== 'CANCELLED' && r.status !== 'REJECTED')
      .reduce((sum, rental) => sum + Number(rental.totalPrice), 0);

    return {
      ...customer,
      statistics: {
        totalRentals,
        activeRentals,
        completedRentals,
        totalSpent,
      },
    };
  }
}
