import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ConnectionsModule } from './connections/connections.module';
import { MatchingModule } from './matching/matching.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [LinksModule, AuthModule, UsersModule, SpotifyModule, MatchingModule, ConnectionsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
