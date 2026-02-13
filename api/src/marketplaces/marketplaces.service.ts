import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplacesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        const marketplaces = await this.prisma.marketplace.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });

        // Serialize BigInt to string
        return marketplaces.map(mp => ({
            ...mp,
            id: mp.id.toString(),
        }));
    }
}
