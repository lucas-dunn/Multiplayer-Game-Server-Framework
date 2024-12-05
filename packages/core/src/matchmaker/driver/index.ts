import { debugMatchMaking } from "../../Debug";
import { logger } from "../../Logger";
import { IRoomListingData, SortOptions, RoomListingData, QueryHelpers, MatchMakerDriver } from "./interfaces";

// re-export
export type { IRoomListingData, SortOptions, RoomListingData, QueryHelpers, MatchMakerDriver };

import { Query } from './Query';
import { RoomCache } from './RoomData';

export class LocalDriver implements MatchMakerDriver {
  public rooms: RoomCache[] = [];

  public createInstance(initialValues: any = {}) {
    return new RoomCache(initialValues, this.rooms);
  }

  public has(roomId: string) {
    return this.rooms.some((room) => room.roomId === roomId);
  }

  public find(conditions: Partial<IRoomListingData>) {
    return this.rooms.filter(((room) => {
      for (const field in conditions) {
        if (
          conditions.hasOwnProperty(field) &&
          room[field] !== conditions[field]
        ) {
          return false;
        }
      }
      return true;
    }));
  }

  public cleanup(processId: string) {
    const cachedRooms = this.find({ processId });
    debugMatchMaking("removing stale rooms by processId %s (%s rooms found)", processId, cachedRooms.length);

    cachedRooms.forEach((room) => room.remove());
    return Promise.resolve();
  }

  public findOne(conditions: Partial<IRoomListingData>) {
    return new Query<RoomListingData>(this.rooms, conditions) as any as QueryHelpers<RoomListingData>;
  }

  public clear() {
    this.rooms = [];
  }

  public shutdown() {
  }
}
