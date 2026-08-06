// Pure assembly for the building-popup details: availability summary per
// bookable library room, and study-space → card mapping. The route handler
// (app/api/building/[code]) does the I/O; this stays testable.

import type { AvailabilityRoomCard, PoiCard, RoomCard } from "@/src/lib/api-types";
import type { PoiDoc } from "./modules/places";
import type { AvailabilityDoc, LibRoomDoc, StudySpaceDoc } from "./modules/spaces";

const toDate = (s: string) => new Date(s.replace(" ", "T")); // "YYYY-MM-DD HH:MM" is local time
const hhmm = (s: string | null) => (s && s.length >= 16 ? s.slice(11, 16) : null);

/**
 * Free-now / free-until / next-free per bookable room, evaluated against the
 * snapshot: today's intervals when the snapshot covers today, otherwise the
 * latest date present (so a stale demo snapshot still shows meaningful slots,
 * anchored to that day's start). `as_of` must always be surfaced by the UI.
 */
export function summarizeAvailability(
  libRooms: LibRoomDoc[],
  intervals: AvailabilityDoc[],
  now: Date,
): { as_of: string | null; rooms: AvailabilityRoomCard[] } | null {
  if (libRooms.length === 0 || intervals.length === 0) return null;
  const today = now.toLocaleDateString("en-CA"); // local YYYY-MM-DD, not UTC
  const dates = [...new Set(intervals.map((a) => a.date).filter(Boolean))] as string[];
  const evalDate = dates.includes(today) ? today : dates.sort().at(-1);
  const evalNow = evalDate === today ? now : toDate(`${evalDate} 00:00`);

  const rooms = libRooms.map((room) => {
    const mine = intervals
      .filter((a) => a.eid === room.eid && a.date === evalDate)
      .sort((a, b) => a.start.localeCompare(b.start));
    const freeNow = mine.find(
      (a) => a.state === "free" && toDate(a.start) <= evalNow && (!a.end || evalNow <= toDate(a.end)),
    );
    const nextFree = mine.find((a) => a.state === "free" && toDate(a.start) > evalNow);
    return {
      title: room.title,
      capacity: room.capacity,
      url: room.url,
      // LibCal thumbnails come protocol-relative ("//libapps…")
      thumbnail: room.thumbnail ? (room.thumbnail.startsWith("//") ? `https:${room.thumbnail}` : room.thumbnail) : null,
      freeNow: !!freeNow,
      freeUntil: freeNow ? hhmm(freeNow.end) : null,
      nextFree: nextFree ? hhmm(nextFree.start) : null,
    };
  });
  return { as_of: intervals.find((a) => a.collected_at)?.collected_at ?? null, rooms };
}

export function toRoomCard(doc: StudySpaceDoc): RoomCard {
  return {
    name: doc.name ?? doc.title,
    capacity: doc.capacity,
    floor: doc.floor,
    layout: doc.layout,
    furniture: doc.furniture,
    photo: doc.photo,
    link: doc.link,
  };
}

export function toPoiCard(doc: PoiDoc): PoiCard {
  return {
    name: doc.name,
    service_type: doc.service_type,
    url: doc.url,
    photo: doc.photo,
    hours: doc.hours,
    contact: doc.contact,
  };
}
