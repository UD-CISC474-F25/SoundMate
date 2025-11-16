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
        auth0Id: "auth0|pikachu_001",
        email: "pikachu@udel.edu",
        username: "pikachu",
        displayName: "Pikachu",
        bio: "Electric type pokemon who loves electronic music",
        spotifyId: "spotify_pikachu_001",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=1",
        spotifyProfileUrl: "https://open.spotify.com/user/pikachu",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|charizard_006",
        email: "charizard@udel.edu",
        username: "charizard",
        displayName: "Charizard",
        bio: "Fire type who brings the heat to every show",
        spotifyId: "spotify_charizard_006",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=12",
        spotifyProfileUrl: "https://open.spotify.com/user/charizard",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|jigglypuff_039",
        email: "jigglypuff@udel.edu",
        username: "jigglypuff",
        displayName: "Jigglypuff",
        bio: "Normal type with a passion for ambient and experimental sounds",
        spotifyId: "spotify_jigglypuff_039",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=5",
        spotifyProfileUrl: "https://open.spotify.com/user/jigglypuff",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|mewtwo_150",
        email: "mewtwo@udel.edu",
        username: "mewtwo",
        displayName: "Mewtwo",
        bio: "Psychic type exploring the depths of sound",
        spotifyId: "spotify_mewtwo_150",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=8",
        spotifyProfileUrl: "https://open.spotify.com/user/mewtwo",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|eevee_133",
        email: "eevee@udel.edu",
        username: "eevee",
        displayName: "Eevee",
        bio: "Normal type with evolving music taste",
        spotifyId: "spotify_eevee_133",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=9",
        spotifyProfileUrl: "https://open.spotify.com/user/eevee",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|snorlax_143",
        email: "snorlax@udel.edu",
        username: "snorlax",
        displayName: "Snorlax",
        bio: "Normal type who loves chill beats and lo-fi",
        spotifyId: "spotify_snorlax_143",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=13",
        spotifyProfileUrl: "https://open.spotify.com/user/snorlax",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|gengar_094",
        email: "gengar@udel.edu",
        username: "gengar",
        displayName: "Gengar",
        bio: "Ghost type into dark wave and industrial",
        spotifyId: "spotify_gengar_094",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=14",
        spotifyProfileUrl: "https://open.spotify.com/user/gengar",
        showSpotifyProfile: true,
        isOnboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        auth0Id: "auth0|vaporeon_134",
        email: "vaporeon@udel.edu",
        username: "vaporeon",
        displayName: "Vaporeon",
        bio: "Water type flowing with synth wave and dream pop",
        spotifyId: "spotify_vaporeon_134",
        profilePhotoUrl: "https://i.pravatar.cc/150?img=15",
        spotifyProfileUrl: "https://open.spotify.com/user/vaporeon",
        showSpotifyProfile: true,
        isOnboarded: true,
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
    prisma.artist.create({
      data: {
        spotifyArtistId: "053q0ukIDRgzwTr4vNSwab",
        name: "Grimes",
        genres: ["art pop", "electronic", "experimental"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb5555555555555555555555",
        spotifyUri: "spotify:artist:053q0ukIDRgzwTr4vNSwab",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "5a2w2tgpLwv26BYJf2qYwu",
        name: "SOPHIE",
        genres: ["hyperpop", "electronic", "experimental pop"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb6666666666666666666666",
        spotifyUri: "spotify:artist:5a2w2tgpLwv26BYJf2qYwu",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "6s22t5Y3prQHyaHWUN1R1C",
        name: "Arca",
        genres: ["experimental", "electronic", "avant-garde"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb7777777777777777777777",
        spotifyUri: "spotify:artist:6s22t5Y3prQHyaHWUN1R1C",
      },
    }),
    prisma.artist.create({
      data: {
        spotifyArtistId: "4qTpGw6KaD79vXWC5yQHW1",
        name: "100 gecs",
        genres: ["hyperpop", "electronic", "glitch pop"],
        imageUrl: "https://i.scdn.co/image/ab6761610000e5eb8888888888888888888888",
        spotifyUri: "spotify:artist:4qTpGw6KaD79vXWC5yQHW1",
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
    prisma.userSpotifyStats.create({
      data: {
        userId: users[3].id,
        accessToken: "mock_access_token_mewtwo_dev_only",
        refreshToken: "mock_refresh_token_mewtwo_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[4].id,
        accessToken: "mock_access_token_eevee_dev_only",
        refreshToken: "mock_refresh_token_eevee_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[5].id,
        accessToken: "mock_access_token_snorlax_dev_only",
        refreshToken: "mock_refresh_token_snorlax_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[6].id,
        accessToken: "mock_access_token_gengar_dev_only",
        refreshToken: "mock_refresh_token_gengar_dev_only",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastSyncedAt: new Date(),
      },
    }),
    prisma.userSpotifyStats.create({
      data: {
        userId: users[7].id,
        accessToken: "mock_access_token_vaporeon_dev_only",
        refreshToken: "mock_refresh_token_vaporeon_dev_only",
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
        artistId: artists[5].id,
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
        artistId: artists[6].id,
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
        artistId: artists[6].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[3].id,
        artistId: artists[6].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[3].id,
        artistId: artists[4].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[4].id,
        artistId: artists[3].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[4].id,
        artistId: artists[7].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[5].id,
        artistId: artists[2].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[5].id,
        artistId: artists[3].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[6].id,
        artistId: artists[1].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[6].id,
        artistId: artists[5].id,
        rank: 2,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[7].id,
        artistId: artists[3].id,
        rank: 1,
      },
    }),
    prisma.userTopArtist.create({
      data: {
        userId: users[7].id,
        artistId: artists[4].id,
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
    prisma.connection.create({
      data: {
        requesterId: users[2].id,
        receiverId: users[6].id,
        status: "ACCEPTED",
        compatibilityScore: 88.9,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[4].id,
        receiverId: users[7].id,
        status: "ACCEPTED",
        compatibilityScore: 95.1,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[5].id,
        receiverId: users[7].id,
        status: "PENDING",
        compatibilityScore: 72.4,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[6].id,
        receiverId: users[1].id,
        status: "ACCEPTED",
        compatibilityScore: 81.3,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[0].id,
        receiverId: users[5].id,
        status: "PENDING",
        compatibilityScore: 63.8,
      },
    }),
    prisma.connection.create({
      data: {
        requesterId: users[3].id,
        receiverId: users[7].id,
        status: "ACCEPTED",
        compatibilityScore: 90.2,
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
        musicTag: "IDM",
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
        musicTag: "Witch House",
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
        musicTag: "Video Game Music",
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
        musicTag: "Synth Pop",
        visibility: "PRIVATE",
        maxAttendees: 6,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[4].id,
        title: "Hyperpop House Party",
        artistId: artists[7].id,
        description: "100 gecs on repeat. Bring your best chaotic energy.",
        dateTime: new Date("2025-11-22T21:00:00"),
        location: "Off-Campus House",
        musicTag: "Hyperpop",
        visibility: "PRIVATE",
        maxAttendees: 15,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[6].id,
        title: "SOPHIE Memorial Listening Session",
        artistId: artists[5].id,
        description: "Celebrating the legacy of SOPHIE. All are welcome.",
        dateTime: new Date("2025-11-18T19:30:00"),
        location: "Music Department Auditorium",
        musicTag: "Experimental Pop",
        visibility: "PUBLIC",
        maxAttendees: 50,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[5].id,
        title: "Lo-Fi Study Session",
        description: "Chill study vibes. Bring your laptop and homework.",
        dateTime: new Date("2025-11-12T14:00:00"),
        location: "Library Quiet Room",
        musicTag: "Lo-Fi",
        visibility: "PUBLIC",
        maxAttendees: 20,
      },
    }),
    prisma.event.create({
      data: {
        creatorId: users[7].id,
        title: "Grimes Art Pop Night",
        artistId: artists[4].id,
        description: "Exploring Grimes discography from Visions to Book 1.",
        dateTime: new Date("2025-11-25T20:00:00"),
        location: "Art Gallery Downtown",
        musicTag: "Art Pop",
        visibility: "PUBLIC",
        maxAttendees: 25,
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
        eventId: events[0].id,
        userId: users[5].id,
        status: "INVITED",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: users[7].id,
        status: "DECLINED",
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
        eventId: events[1].id,
        userId: users[6].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: users[0].id,
        status: "DECLINED",
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
    prisma.eventAttendee.create({
      data: {
        eventId: events[2].id,
        userId: users[5].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[2].id,
        userId: users[1].id,
        status: "INVITED",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[3].id,
        userId: users[3].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[3].id,
        userId: users[7].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[3].id,
        userId: users[4].id,
        status: "MAYBE",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[4].id,
        userId: users[4].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[4].id,
        userId: users[7].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[4].id,
        userId: users[3].id,
        status: "MAYBE",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[4].id,
        userId: users[6].id,
        status: "DECLINED",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[5].id,
        userId: users[6].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[5].id,
        userId: users[1].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[5].id,
        userId: users[2].id,
        status: "INVITED",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[5].id,
        userId: users[0].id,
        status: "MAYBE",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[6].id,
        userId: users[5].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[6].id,
        userId: users[2].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[6].id,
        userId: users[3].id,
        status: "INVITED",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[7].id,
        userId: users[7].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[7].id,
        userId: users[4].id,
        status: "GOING",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[7].id,
        userId: users[2].id,
        status: "MAYBE",
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[7].id,
        userId: users[1].id,
        status: "INVITED",
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
        eventId: events[0].id,
        userId: users[4].id,
        content: "Might be late but I'll try to make it.",
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
        eventId: events[1].id,
        userId: users[6].id,
        content: "This is going to be incredible. Count me in.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[2].id,
        userId: users[0].id,
        content: "What time should I arrive? Should I bring anything?",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[2].id,
        userId: users[2].id,
        content: "Just bring yourself. I'll have snacks and drinks.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[3].id,
        userId: users[3].id,
        content: "Meeting at 6pm outside the venue. Don't be late.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[3].id,
        userId: users[7].id,
        content: "See you there. So hyped for this show.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[4].id,
        userId: users[4].id,
        content: "100 gecs all night. This is going to be chaos.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[4].id,
        userId: users[7].id,
        content: "Bringing aux cord backup just in case.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[4].id,
        userId: users[3].id,
        content: "Not sure if I can handle this much hyperpop but I'll try.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[5].id,
        userId: users[6].id,
        content: "This means a lot. SOPHIE's work changed everything.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[5].id,
        userId: users[1].id,
        content: "Will there be tissues? I know I'm going to cry.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[6].id,
        userId: users[5].id,
        content: "Perfect for getting work done. See you all there.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[6].id,
        userId: users[2].id,
        content: "I'll bring my noise cancelling headphones.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[7].id,
        userId: users[7].id,
        content: "Art Angel is still her best work. Fight me.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[7].id,
        userId: users[4].id,
        content: "Miss Anthropocene deserves more love tbh.",
      },
    }),
    prisma.eventComment.create({
      data: {
        eventId: events[7].id,
        userId: users[2].id,
        content: "Can we start with Visions? That album is perfect.",
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
