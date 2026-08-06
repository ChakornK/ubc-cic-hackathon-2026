"use client";

// Building popup for the campus map: click a footprint → header card with the
// building's vitals plus swipeable carousels of rooms (Find a Space), bookable
// study rooms (LibCal availability snapshot), and food & services (POIs).
// Ported from the LLM-VIZ-PRACTICE popup, restyled to this app's tokens.
//
// Card images: when a card has a link, the image comes from /api/preview?url=
// (server-side og:image resolution — stored thumbnails are signed URLs that go
// stale); otherwise the stored photo. The image slot is always reserved: a
// placeholder shows until load and stays on failure.

import { Icon } from "@/src/components/icons";
import { useApi } from "@/src/components/providers";
import type { BuildingDetails } from "@/src/lib/api-types";
import { useEffect, useRef, useState } from "react";

export interface SelectedBuilding {
  code: string;
  name: string;
  usage: string | null;
  floors: string | null;
  address: string | null;
}

function Carousel({ label, children }: { label: string; children: React.ReactNode[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: -1 | 1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth, behavior: "smooth" });
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Previous ${label}`}
        onClick={() => scrollBy(-1)}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors duration-150 hover:text-primary"
      >
        <Icon name="left" size={14} />
      </button>
      <div
        ref={scroller}
        className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label={`Next ${label}`}
        onClick={() => scrollBy(1)}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors duration-150 hover:text-primary"
      >
        <Icon name="right" size={14} />
      </button>
    </div>
  );
}

const preview = (href: string) => `/api/preview?url=${encodeURIComponent(href)}`;

function DetailCard({
  src,
  href,
  title,
  sub,
  meta,
  dot,
}: {
  /** Image URL, already chosen by the caller (direct photo or preview proxy). */
  src?: string | null;
  href?: string | null;
  title: string;
  sub?: string | null;
  meta?: string | null;
  dot?: "free" | "busy";
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const body = (
    <>
      <div className="relative h-32 shrink-0 overflow-hidden bg-surface-container">
        <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-35" aria-hidden="true">
          🏛
        </span>
        {src && !failed && (
          // biome-ignore lint/performance/noImgElement: images come from arbitrary external hosts — next/image would need a remotePattern per host
          <img
            src={src}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`relative h-full w-full bg-surface-bright object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface">
          {dot && (
            // The sub line states the availability in words; the dot is decoration.
            <span
              className={`size-2 shrink-0 rounded-full ${dot === "free" ? "bg-emerald-500" : "bg-red-500"}`}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{title}</span>
        </span>
        {sub && <span className="text-xs text-on-surface-variant">{sub}</span>}
        {meta && <span className="truncate text-xs text-muted">{meta}</span>}
      </div>
    </>
  );
  const cardClass =
    "flex w-full shrink-0 snap-start snap-always flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface-container-low";
  return href ? (
    <a className={cardClass} href={href} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <div className={cardClass}>{body}</div>
  );
}

function Section({ title, note, children }: { title: string; note?: string | null; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-subtle pt-2.5">
      <h3 className="mb-2 text-sm font-semibold text-on-surface">
        {title}
        {note && <span className="ml-1.5 font-normal text-xs text-muted">{note}</span>}
      </h3>
      {children}
    </section>
  );
}

export function BuildingPopup({ building, onClose }: { building: SelectedBuilding; onClose: () => void }) {
  const api = useApi();
  const [details, setDetails] = useState<BuildingDetails | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setFailed(false);
    api
      .getBuildingDetails(building.code)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api, building.code]);

  const availability = details?.availability;
  return (
    <aside
      aria-label={`${building.name} details`}
      className="absolute bottom-6 left-3 top-3 z-20 flex w-80 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface/95 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-start gap-2.5 border-b border-border-subtle px-3.5 py-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary-container text-on-secondary-container">
          <Icon name="building1" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium leading-snug text-on-surface">{building.name}</h2>
          <p className="mt-0.5 truncate font-mono text-xs text-on-surface-variant">
            {[building.code, building.usage].filter(Boolean).join(" · ")}
          </p>
          {(building.floors || building.address) && (
            <p className="mt-0.5 truncate text-xs text-muted">
              {[building.floors && `${building.floors} floors`, building.address].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close building details"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-primary"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3.5 py-3">
        {!details && !failed && (
          <div className="flex flex-col gap-2" role="status" aria-label="Loading details">
            <div className="h-32 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container" />
          </div>
        )}
        {failed && <p className="text-sm text-on-surface-variant">Couldn't load details for this building.</p>}
        {details && (
          <>
            {details.rooms.length > 0 && (
              <Section title={`Rooms (${details.rooms.length})`}>
                <Carousel label="rooms">
                  {details.rooms.map((room) => (
                    <DetailCard
                      key={room.name}
                      // room pages carry fresh photos; the stored thumbnail is a stale signed URL
                      src={room.link ? preview(room.link) : room.photo}
                      href={room.link}
                      title={room.name}
                      sub={`${room.capacity ?? "?"} seats · floor ${room.floor ?? "?"}`}
                      meta={[room.layout, room.furniture].filter(Boolean).join(" · ")}
                    />
                  ))}
                </Carousel>
              </Section>
            )}
            {availability && availability.rooms.length > 0 && (
              <Section title="Study rooms" note={availability.as_of ? `as of ${availability.as_of.slice(0, 10)}` : null}>
                <Carousel label="study rooms">
                  {availability.rooms.map((room) => (
                    <DetailCard
                      key={room.title}
                      // LibCal catalog thumbnails are stable direct URLs; LibCal pages rarely expose og:image
                      src={room.thumbnail ?? (room.url ? preview(room.url) : null)}
                      href={room.url}
                      title={room.title}
                      dot={room.freeNow ? "free" : "busy"}
                      sub={
                        room.freeNow
                          ? `free until ${room.freeUntil ?? "end of day"}`
                          : room.nextFree
                            ? `free at ${room.nextFree}`
                            : "booked today"
                      }
                      meta={`${room.capacity ?? "?"} people · book on LibCal`}
                    />
                  ))}
                </Carousel>
              </Section>
            )}
            {details.pois.length > 0 && (
              <Section title={`Food & services (${details.pois.length})`}>
                <Carousel label="services">
                  {details.pois.map((poi) => (
                    <DetailCard
                      key={poi.name}
                      src={poi.url ? preview(poi.url) : poi.photo}
                      href={poi.url}
                      title={poi.name}
                      sub={poi.service_type?.replace(/_/g, " ")}
                      meta={poi.hours || poi.contact}
                    />
                  ))}
                </Carousel>
              </Section>
            )}
            {details.rooms.length === 0 && !availability?.rooms.length && details.pois.length === 0 && (
              <p className="text-sm text-on-surface-variant">No room or service listings for this building.</p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
