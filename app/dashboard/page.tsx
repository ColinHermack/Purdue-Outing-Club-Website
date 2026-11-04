/**
 * The signed-in member's dashboard: their trips, trip readiness (dues, waiver, policy), first aid, driver
 * certification and emergency contact. Everything here is informational. This is the first step of the rollout of user
 * sign-in, currently open to trip leaders and officers.
 *
 * @author Colin Hermack
 */

"use client";

import { Button, Card, Link, Pagination } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import PageMessage from "@/components/PageMessage";
import MemberDTO from "@/dtos/memberDto";
import TripDTO from "@/dtos/tripDto";
import {
  expiryStatus,
  formatTripDates,
  signupBlockers,
} from "@/utils/memberStatus";
import { buildPageItems } from "@/utils/pagination";
import { protectedFetch } from "@/utils/protectedFetch";

const TRIPS_PER_PAGE = 5;

type Tone = "ok" | "bad" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  ok: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  bad: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  neutral: "bg-default text-muted",
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`h-[26px] px-2.5 rounded-full text-xs font-semibold inline-flex items-center ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

function ReadinessRow({
  label,
  value,
  tone,
}: {
  label: string;
  value?: string;
  tone: Tone;
}) {
  const icon = tone === "ok" ? "✓" : tone === "bad" ? "!" : "–";

  return (
    <div className="py-2 flex items-start gap-3 border-t border-border first:border-t-0">
      <span
        aria-hidden="true"
        className={`size-6 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${TONE_CLASSES[tone]}`}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {value ? <span className="text-[13px] text-muted">{value}</span> : null}
      </div>
    </div>
  );
}

function SideCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <Card.Content className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-lg font-bold">{title}</h2>
          {badge}
        </div>
        {children}
      </Card.Content>
    </Card>
  );
}

function formatExpiry(value: unknown): string {
  return typeof value === "string"
    ? new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
}

export default function DashBoardPage() {
  const [user, setUser] = useState<MemberDTO | null>(null);
  const [userFailed, setUserFailed] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [trips, setTrips] = useState<TripDTO[] | null>(null);
  const [tripsFailed, setTripsFailed] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    protectedFetch<MemberDTO>("/api/protected/user").then((result) => {
      if (result.status === "ok") setUser(result.data);
      else if (result.status === "forbidden") setForbidden(true);
      else setUserFailed(true);
    });

    protectedFetch<TripDTO[]>("/api/protected/user/trips").then((result) => {
      if (result.status === "ok") setTrips(result.data);
      else setTripsFailed(true);
    });
  }, []);

  const sortedTrips = useMemo(
    () =>
      [...(trips ?? [])].sort(
        (a, b) =>
          new Date(b.startDate ?? 0).getTime() -
          new Date(a.startDate ?? 0).getTime(),
      ),
    [trips],
  );

  if (forbidden) {
    return (
      <PageMessage
        action={
          <Link className="button" href="/auth/signout">
            Sign Out
          </Link>
        }
        title="Not Available Yet"
      >
        <title>My Dashboard - Purdue Outing Club</title>
        <p>
          Sign-in is currently limited to club trip leaders and officers. It
          will open to all members later.
        </p>
      </PageMessage>
    );
  }

  if (userFailed) {
    return (
      <PageMessage
        action={
          <Button onPress={() => window.location.reload()}>Try Again</Button>
        }
        title="Something Went Wrong"
      >
        <title>My Dashboard - Purdue Outing Club</title>
        <p>We couldn&#39;t load your member profile.</p>
      </PageMessage>
    );
  }

  const pageCount = Math.max(1, Math.ceil(sortedTrips.length / TRIPS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * TRIPS_PER_PAGE;
  const visible = sortedTrips.slice(firstIndex, firstIndex + TRIPS_PER_PAGE);

  const blockers = user ? signupBlockers(user) : [];
  const banner = blockers.length
    ? `${blockers.join(" and ").replace(/^./, (c) => c.toUpperCase())}.`
    : "";
  const dues = user ? expiryStatus(user.duesData) : "none";
  const duesExpires = formatExpiry(
    (user?.duesData as { Expires?: string })?.Expires,
  );
  const driver = user ? expiryStatus(user.driverData) : "none";
  const firstAid = user
    ? expiryStatus(user.firstAidData && { Expires: user.firstAidData.expires })
    : "none";

  return (
    <div className="w-full max-w-[1120px] mx-auto pb-12 flex flex-col gap-6">
      <title>My Dashboard - Purdue Outing Club</title>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">
          {user ? user.name : "Loading..."}
        </h1>
        {user ? (
          <p className="text-sm text-muted">
            {[user.email, user.schoolYear].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </header>

      {banner ? (
        <div
          className="rounded-2xl border border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200 px-5 py-4 flex flex-col gap-0.5"
          role="status"
        >
          <span className="font-semibold">
            You can&#39;t sign up for trips yet
          </span>
          <span className="text-sm">{banner}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-6 items-start">
        <Card className="flex-[999_1_520px] min-w-0">
          <Card.Content className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">My trips</h2>
            {tripsFailed ? (
              <p>Couldn&#39;t load your trips.</p>
            ) : trips === null ? (
              <p>Loading...</p>
            ) : visible.length === 0 ? (
              <p>No trips to display.</p>
            ) : (
              <div className="flex flex-col">
                {visible.map((trip) => (
                  <Link
                    key={trip.tripId}
                    className="py-3 px-2 flex flex-col gap-0.5 no-underline"
                    href={`/trips/${trip.tripId}`}
                  >
                    <span className="font-semibold">{trip.name}</span>
                    <span className="text-sm text-muted">
                      {[
                        trip.location,
                        formatTripDates(trip.startDate, trip.endDate),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {sortedTrips.length > TRIPS_PER_PAGE ? (
              <Pagination aria-label="Trip pages" className="justify-between">
                <Pagination.Summary>
                  {`Showing ${firstIndex + 1}–${firstIndex + visible.length} of ${sortedTrips.length}`}
                </Pagination.Summary>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={currentPage === 1}
                      onPress={() => setPage(currentPage - 1)}
                    >
                      <Pagination.PreviousIcon />
                    </Pagination.Previous>
                  </Pagination.Item>
                  {buildPageItems(currentPage, pageCount).map((item, index) =>
                    item === null ? (
                      <Pagination.Item key={`gap-${index}`}>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    ) : (
                      <Pagination.Item key={item}>
                        <Pagination.Link
                          aria-label={`Page ${item}`}
                          isActive={item === currentPage}
                          onPress={() => setPage(item)}
                        >
                          {item}
                        </Pagination.Link>
                      </Pagination.Item>
                    ),
                  )}
                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={currentPage === pageCount}
                      onPress={() => setPage(currentPage + 1)}
                    >
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            ) : null}
          </Card.Content>
        </Card>

        <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-6">
          {user ? (
            <>
              <SideCard title="Trip readiness">
                <ReadinessRow
                  label="Dues"
                  tone={dues === "valid" ? "ok" : "bad"}
                  value={
                    dues === "valid"
                      ? `Expires ${duesExpires}`
                      : dues === "expired"
                        ? `Expired ${duesExpires}`
                        : "Not paid"
                  }
                />
                <ReadinessRow
                  label="Liability waiver"
                  tone={user.waiverAgreement ? "ok" : "bad"}
                  value={user.waiverAgreement ? undefined : "Not signed"}
                />
                <ReadinessRow
                  label="Club policy agreement"
                  tone={user.policyAgreement ? "ok" : "bad"}
                  value={user.policyAgreement ? undefined : "Not signed"}
                />
              </SideCard>

              <SideCard
                badge={
                  <Badge tone={firstAid === "valid" ? "ok" : "neutral"}>
                    {firstAid === "valid"
                      ? "Valid"
                      : firstAid === "expired"
                        ? "Expired"
                        : "None"}
                  </Badge>
                }
                title="First aid"
              >
                {user.firstAidData?.type ? (
                  <>
                    <span className="font-semibold">
                      {user.firstAidData.type}
                    </span>
                    <span className="text-sm text-muted">
                      {`${firstAid === "expired" ? "Expired" : "Expires"} ${formatExpiry(user.firstAidData.expires)}`}
                      {user.firstAidData.verified
                        ? " · Verified by Health and Safety Officer"
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted">
                    No first aid certification on file.
                  </span>
                )}
              </SideCard>

              <SideCard
                badge={
                  <Badge tone={driver === "valid" ? "ok" : "neutral"}>
                    {driver === "valid" ? "Certified" : "Not certified"}
                  </Badge>
                }
                title="Driver certification"
              >
                <span className="text-sm text-muted">
                  {driver === "valid"
                    ? `Expires ${formatExpiry((user.driverData as { Expires?: string }).Expires)}`
                    : "Every car on a club trip needs two certified drivers, so certified drivers are more likely to get a spot."}
                </span>
              </SideCard>

              <SideCard title="Emergency contact">
                {user.emergencyData?.name ? (
                  <>
                    <span className="font-semibold">
                      {user.emergencyData.name}
                    </span>
                    <span className="text-sm text-muted">
                      {[user.emergencyData.relation, user.emergencyData.phone]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted">
                    No emergency contact on file.
                  </span>
                )}
              </SideCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
