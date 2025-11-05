import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/jwt.strategy';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) {} 

    async findAll() {
        return this.prisma.event.findMany();
    }

    async findOne(id: string) {
        return this.prisma.event.findUnique({
            where: { id },
        });
    }
}
