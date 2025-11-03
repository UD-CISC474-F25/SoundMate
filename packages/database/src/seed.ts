import { prisma } from "./client";

async function main() {
  await prisma.eventComment.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.userTopArtist.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.userSpotifyStats.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "pikachu@udel.edu",
        username: "pikachu",
        displayName: "Pikachu",
        bio: "Electric type pokemon who loves electronic music",
        spotifyId: "spotify_pikachu_001",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=1",
        spotifyProfileUrl: "https://open.spotify.com/user/pikachu",
        showSpotifyProfile: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "charizard@udel.edu",
        username: "charizard",
        displayName: "Charizard",
        bio: "Fire type who brings the heat to every show",
        spotifyId: "spotify_charizard_006",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=12",
        spotifyProfileUrl: "https://open.spotify.com/user/charizard",
        showSpotifyProfile: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "jigglypuff@udel.edu",
        username: "jigglypuff",
        displayName: "Jigglypuff",
        bio: "Normal type with a passion for ambient and experimental sounds",
        spotifyId: "spotify_jigglypuff_039",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=5",
        spotifyProfileUrl: "https://open.spotify.com/user/jigglypuff",
        showSpotifyProfile: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "mewtwo@udel.edu",
        username: "mewtwo",
        displayName: "Mewtwo",
        bio: "Psychic type exploring the depths of sound",
        spotifyId: "spotify_mewtwo_150",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=8",
        spotifyProfileUrl: "https://open.spotify.com/user/mewtwo",
        showSpotifyProfile: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "eevee@udel.edu",
        username: "eevee",
        displayName: "Eevee",
        bio: "Normal type with evolving music taste",
        spotifyId: "spotify_eevee_133",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=9",
        spotifyProfileUrl: "https://open.spotify.com/user/eevee",
        showSpotifyProfile: true,
      },
    }),
  ]);

  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        spotifyArtistId: "6kBDZFXuLrZgHnvmPu9NsG",
        name: "Aphex Twin",
        genres: ["electronic", "idm", "ambient"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb1111111111111111111111",
        spotifyUri: "spotify:artist:6kBDZFXuLrZgHnvmPu9NsG",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "7FO16GJLbYvlIWxWs4NvU5",
        name: "Crystal Castles",
        genres: ["electronic", "witch house", "synth punk"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb2222222222222222222222",
        spotifyUri: "spotify:artist:7FO16GJLbYvlIWxWs4NvU5",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "3Isy6kedDrgPYoTS1dazA9",
        name: "Sonic the Hedgehog",
        genres: ["video game music", "electronic", "soundtrack"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb3333333333333333333333",
        spotifyUri: "spotify:artist:3Isy6kedDrgPYoTS1dazA9",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "10bRp2xJ4GMWObyJFLpk4e",
        name: "Magdalena Bay",
        genres: ["synth pop", "indie pop", "dream pop"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb4444444444444444444444",
        spotifyUri: "spotify:artist:10bRp2xJ4GMWObyJFLpk4e",
      },
    }),
  ]);

  await Promise.all([
    prisma.userSpotifyStats.create({
      data: {
        userId: users[0].id,
        accessToken: "mock_access_token_pikachu_dev_only",
        refreshToken: "mock_refresh_token_pikachu_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[1].id,
        accessToken: "mock_access_token_charizard_dev_only",
        refreshToken: "mock_refresh_token_charizard_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[2].id,
        accessToken: "mock_access_token_jigglypuff_dev_only",
        refreshToken: "mock_refresh_token_jigglypuff_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
  ]);

  await Promise.all([
    prisma.userTopArtist.create({
      data: {
        userId: users[0].id,
        artistId: artists[0].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[0].id,
        artistId: artists[3].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[1].id,
        artistId: artists[1].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[1].id,
        artistId: artists[2].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[2].id,
        artistId: artists[0].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[2].id,
        artistId: artists[2].id,
        rank: 2,
      },
    }),
  ]);

  await Promise.all([
    prisma.connection.create({
      data: {
        requesterId: users[0].id,
        receiverId: users[1].id,
        status: "ACCEPTED",
        compatibilityScore: 78.5,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[0].id,
        receiverId: users[2].id,
        status: "ACCEPTED",
        compatibilityScore: 92.3,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[1].id,
        receiverId: users[3].id,
        status: "ACCEPTED",
        compatibilityScore: 85.7,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[3].id,
        receiverId: users[4].id,
        status: "PENDING",
        compatibilityScore: 67.2,
      },
    }),
  ]);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        creatorId: users[0].id,
        title: "Aphex Twin Listening Party",
        artistId: artists[0].id,
        description: "Deep dive into Selected Ambient Works. Bring headphones for the best experience.",
        dateTime: new Date("2025-11-15T19:00:00"),
        location: "Student Center Room 204",
        visibility: "PUBLIC",
        maxAttendees: 30,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[1].id,
        title: "Crystal Castles Tribute Night",
        artistId: artists[1].id,
        description: "Playing all the classics from I and II. Dark vibes only.",
        dateTime: new Date("2025-11-20T18:00:00"),
        location: "Underground Venue",
        visibility: "PUBLIC",
        maxAttendees: 8,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[2].id,
        title: "Sonic OST Marathon",
        artistId: artists[2].id,
        description: "Running through all the best Sonic soundtracks from the games.",
        dateTime: new Date("2025-11-10T20:00:00"),
        location: "Gaming Lounge",
        visibility: "PRIVATE",
        maxAttendees: 10,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[3].id,
        title: "Magdalena Bay Concert Meetup",
        artistId: artists[3].id,
        description: "Going to see Magdalena Bay live. Looking for people to carpool with.",
        dateTime: new Date("2025-11-08T18:30:00"),
        location: "The Fillmore",
        visibility: "PRIVATE",
        maxAttendees: 6,
      },
    }),
  ]);

  await Promise.all([
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[0].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[2].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[4].id,
        status: "MAYBE",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: users[1].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: users[3].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[2].id,
        userId: users[2].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[2].id,
        userId: users[0].id,
        status: "GOING",
      },
    }),
  ]);

  await Promise.all([
    prisma.eventComment.create({
      data: {
        eventId: events[0].id,
        userId: users[2].id,
        content: "So excited for this. I'll bring headphones.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[0].id,
        userId: users[0].id,
        content: "Can't wait to hear Selected Ambient Works in full.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[1].id,
        userId: users[3].id,
        content: "I can drive. My car fits 4 people.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[1].id,
        userId: users[1].id,
        content: "Perfect. Thanks for offering to drive.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[2].id,
        userId: users[0].id,
        content: "What time should I arrive? Should I bring anything?",
      },
    }),
  ]);
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
