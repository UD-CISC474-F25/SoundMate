import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/jwt.strategy';

@Injectable()
export class ConnectionsService {
    constructor(private prisma: PrismaService) {} 

    async findAll() {
    return this.prisma.connection.findMany();
    }

    async findOne(id: string) {
        return this.prisma.connection.findUnique({
            where: { id },
        });
    }
}
