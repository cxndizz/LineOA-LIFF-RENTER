import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      include: {
        rentals: {
          include: {
            product: true,
            branch: true,
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

    // Calculate total spent and rental count for each customer
    return customers.map((customer) => {
      const totalSpent = customer.rentals.reduce(
        (sum, rental) => sum + Number(rental.totalPrice),
        0
      );
      const rentalCount = customer.rentals.length;
      const activeRentals = customer.rentals.filter(
        (rental) => rental.status === 'IN_USE'
      ).length;

      return {
        ...customer,
        totalSpent,
        rentalCount,
        activeRentals,
      };
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        rentals: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            branch: true,
            payment: true,
            statusHistory: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Calculate statistics
    const totalSpent = customer.rentals.reduce(
      (sum, rental) => sum + Number(rental.totalPrice),
      0
    );
    const rentalCount = customer.rentals.length;
    const activeRentals = customer.rentals.filter(
      (rental) => rental.status === 'IN_USE'
    ).length;
    const completedRentals = customer.rentals.filter(
      (rental) => rental.status === 'RETURNED'
    ).length;

    return {
      ...customer,
      statistics: {
        totalSpent,
        rentalCount,
        activeRentals,
        completedRentals,
      },
    };
  }

  async findRentalHistory(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const rentals = await this.prisma.rentalOrder.findMany({
      where: { customerId: id },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        branch: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rentals;
  }
}
