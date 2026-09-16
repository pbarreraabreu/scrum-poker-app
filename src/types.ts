export type FirestoreTimestampLike = {
  toMillis?: () => number;
};

export type Session = {
  id: string;
  code?: string;
  name?: string | null;
  facilitatorUid?: string;
  activeRoundId?: string;
  status?: string;
};

export type ParticipantRole = 'facilitator' | 'player' | 'spectator';

export type ParticipantStatus = 'online' | 'transient' | 'offline';

export type Participant = {
  id: string;
  uid?: string;
  nickname?: string;
  role?: ParticipantRole;
  connected?: boolean;
  joinedAt?: FirestoreTimestampLike;
  lastSeen?: FirestoreTimestampLike;
  leftAt?: FirestoreTimestampLike;
  status: ParticipantStatus;
  online: boolean;
};

export type Round = {
  id: string;
  status?: 'voting' | 'revealed';
  story?: string | null;
  startedAt?: FirestoreTimestampLike;
};

export type RoomCodeLookup = {
  sessionId?: string;
};
