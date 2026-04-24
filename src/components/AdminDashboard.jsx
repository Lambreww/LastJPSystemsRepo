import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import "./AdminDashboard.css";

const RANGE_OPTIONS = [
  { value: 1, label: "1d" },
  { value: 3, label: "3d" },
  { value: 7, label: "7d" },
  { value: "all", label: "All time" },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDayKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pctChange(current, previous) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rangeDays, setRangeDays] = useState(1);
  const hasLoadedRef = useRef(false);

  const [events, setEvents] = useState([]); // analytics_events
  const [users, setUsers] = useState([]);   // users (registrations)

  useEffect(() => {
    const run = async () => {
      if (hasLoadedRef.current) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // взимаме текущия период + предишен същия период за сравнение
      const isAllTime = rangeDays === "all";
      const today = startOfDay(new Date());
      const totalDays = isAllTime ? null : rangeDays * 2;
      const fromDate = isAllTime ? null : addDays(today, -(totalDays - 1));
      const fromTs = fromDate ? Timestamp.fromDate(fromDate) : null;

      const eventsQ = fromTs
        ? query(collection(db, "analytics_events"), where("createdAt", ">=", fromTs))
        : query(collection(db, "analytics_events"));

      const usersQ = fromTs
        ? query(collection(db, "users"), where("createdAt", ">=", fromTs))
        : query(collection(db, "users"));

      const [eventsSnap, usersSnap] = await Promise.all([
        getDocs(eventsQ),
        getDocs(usersQ),
      ]);

      const ev = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const us = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setEvents(ev);
      setUsers(us);
      setLoading(false);
      setIsRefreshing(false);
      hasLoadedRef.current = true;
    };

    run().catch((e) => {
      console.error("AdminDashboard load error:", e);
      setLoading(false);
      setIsRefreshing(false);
    });
  }, [rangeDays]);

  const computed = useMemo(() => {
    const today = startOfDay(new Date());
    const isAllTime = rangeDays === "all";
    const chartDays = 14;
    const totalDays = isAllTime ? chartDays : rangeDays * 2;
    const dayKeys = Array.from({ length: totalDays }, (_, i) =>
      formatDayKey(addDays(today, -(totalDays - 1) + i))
    );

    const initSeries = () =>
      dayKeys.reduce((acc, k) => {
        acc[k] = 0;
        return acc;
      }, {});

    const visitorsByDay = initSeries();
    const regsByDay = initSeries();

    // уникални visitors на ден: Set(visitorId)
    const visitorSets = dayKeys.reduce((acc, k) => {
      acc[k] = new Set();
      return acc;
    }, {});

    // pageviews на ден
    const pageviewsByDay = initSeries();

    // sessions на ден: Set(sessionId) от session_start
    const sessionSets = dayKeys.reduce((acc, k) => {
      acc[k] = new Set();
      return acc;
    }, {});

    // events
    for (const e of events) {
      if (!e.createdAt?.toDate) continue;
      const dt = e.createdAt.toDate();
      const key = formatDayKey(dt);

      if (!(key in pageviewsByDay)) continue;

      if (e.type === "pageview") {
        pageviewsByDay[key] += 1;
        if (e.visitorId) visitorSets[key].add(e.visitorId);
      }

      if (e.type === "session_start") {
        if (e.sessionId) sessionSets[key].add(e.sessionId);
        if (e.visitorId) visitorSets[key].add(e.visitorId);
      }
    }

    // users (registrations)
    for (const u of users) {
      if (!u.createdAt?.toDate) continue;
      const dt = u.createdAt.toDate();
      const key = formatDayKey(dt);
      if (key in regsByDay) regsByDay[key] += 1;
    }

    // финални visitors count на ден
    for (const k of dayKeys) {
      visitorsByDay[k] = visitorSets[k].size;
    }

    const sumRange = (obj, keys) => keys.reduce((s, k) => s + (obj[k] || 0), 0);

    const splitIndex = isAllTime ? 0 : dayKeys.length - rangeDays;
    const lastKeys = isAllTime ? dayKeys : dayKeys.slice(splitIndex);
    const prevKeys = isAllTime ? [] : dayKeys.slice(0, splitIndex);

    let uniqueVisitors;
    let uniqueVisitorsPrev;
    let pageviews;
    let pageviewsPrev;
    let sessions;
    let sessionsPrev;
    let regs;
    let regsPrev;

    if (isAllTime) {
      const visitorIds = new Set();
      const sessionIds = new Set();

      pageviews = 0;

      for (const e of events) {
        if (e.type === "pageview") {
          pageviews += 1;
        }

        if (e.visitorId) {
          visitorIds.add(e.visitorId);
        }

        if (e.type === "session_start" && e.sessionId) {
          sessionIds.add(e.sessionId);
        }
      }

      uniqueVisitors = visitorIds.size;
      sessions = sessionIds.size;
      regs = users.length;

      uniqueVisitorsPrev = 0;
      pageviewsPrev = 0;
      sessionsPrev = 0;
      regsPrev = 0;
    } else {
      uniqueVisitors = sumRange(visitorsByDay, lastKeys);
      uniqueVisitorsPrev = prevKeys.length ? sumRange(visitorsByDay, prevKeys) : 0;

      pageviews = sumRange(pageviewsByDay, lastKeys);
      pageviewsPrev = prevKeys.length ? sumRange(pageviewsByDay, prevKeys) : 0;

      sessions = lastKeys.reduce((s, k) => s + sessionSets[k].size, 0);
      sessionsPrev = prevKeys.length ? prevKeys.reduce((s, k) => s + sessionSets[k].size, 0) : 0;

      regs = sumRange(regsByDay, lastKeys);
      regsPrev = prevKeys.length ? sumRange(regsByDay, prevKeys) : 0;
    }

    const conv = uniqueVisitors > 0 ? Math.round((regs / uniqueVisitors) * 1000) / 10 : 0;
    const convPrev = uniqueVisitorsPrev > 0 ? Math.round((regsPrev / uniqueVisitorsPrev) * 1000) / 10 : 0;

    // за графика: текущ период + предходен период
    const chart = dayKeys.map((k) => ({
      day: k,
      visitors: visitorsByDay[k],
      registrations: regsByDay[k],
    }));

    const maxY = Math.max(
      1,
      ...chart.map((x) => Math.max(x.visitors, x.registrations))
    );

    return {
      kpis: {
        uniqueVisitors,
        sessions,
        pageviews,
        regs,
        conv,
      },
      compare: {
        uniqueVisitors: isAllTime ? null : pctChange(uniqueVisitors, uniqueVisitorsPrev),
        sessions: isAllTime ? null : pctChange(sessions, sessionsPrev),
        pageviews: isAllTime ? null : pctChange(pageviews, pageviewsPrev),
        regs: isAllTime ? null : pctChange(regs, regsPrev),
        conv: isAllTime ? null : pctChange(conv, convPrev),
      },
      chart,
      maxY,
      isAllTime,
    };
  }, [events, rangeDays, users]);

  if (loading) {
    return <div className="adminDash">Зареждане на статистики…</div>;
  }

  return (
    <div className="adminDash">
      <div className="adminDashTop">
        <h2 className="adminDashTitle">Dashboard</h2>

        <div className="rangePicker" aria-label="Избор на период">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={`rangeButton ${option.value === rangeDays ? "active" : ""}`}
              onClick={() => setRangeDays(option.value)}
              disabled={isRefreshing && option.value === rangeDays}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`adminDashBody ${isRefreshing ? "is-refreshing" : ""}`}>
      <div className="kpiGrid">
        <div className="kpiCard">
          <div className="kpiLabel">Unique visitors ({computed.isAllTime ? "All time" : `${rangeDays}d`})</div>
          <div className="kpiValue">{computed.kpis.uniqueVisitors}</div>
          {computed.compare.uniqueVisitors !== null && (
            <div className={`kpiDelta ${computed.compare.uniqueVisitors >= 0 ? "up" : "down"}`}>
              {computed.compare.uniqueVisitors >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.uniqueVisitors)}% vs prev {rangeDays}d
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Sessions/Visits ({computed.isAllTime ? "All time" : `${rangeDays}d`})</div>
          <div className="kpiValue">{computed.kpis.sessions}</div>
          {computed.compare.sessions !== null && (
            <div className={`kpiDelta ${computed.compare.sessions >= 0 ? "up" : "down"}`}>
              {computed.compare.sessions >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.sessions)}% vs prev {rangeDays}d
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Pageviews ({computed.isAllTime ? "All time" : `${rangeDays}d`})</div>
          <div className="kpiValue">{computed.kpis.pageviews}</div>
          {computed.compare.pageviews !== null && (
            <div className={`kpiDelta ${computed.compare.pageviews >= 0 ? "up" : "down"}`}>
              {computed.compare.pageviews >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.pageviews)}% vs prev {rangeDays}d
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Registrations ({computed.isAllTime ? "All time" : `${rangeDays}d`})</div>
          <div className="kpiValue">{computed.kpis.regs}</div>
          {computed.compare.regs !== null && (
            <div className={`kpiDelta ${computed.compare.regs >= 0 ? "up" : "down"}`}>
              {computed.compare.regs >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.regs)}% vs prev {rangeDays}d
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Conversion rate ({computed.isAllTime ? "All time" : `${rangeDays}d`})</div>
          <div className="kpiValue">{computed.kpis.conv}%</div>
          {computed.compare.conv !== null && (
            <div className={`kpiDelta ${computed.compare.conv >= 0 ? "up" : "down"}`}>
              {computed.compare.conv >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.conv)}% vs prev {rangeDays}d
            </div>
          )}
        </div>
      </div>

      <div className="chartCard">
        <div className="chartTitle">
          {computed.isAllTime
            ? "Visitors per day vs Registrations per day (last 14 days preview)"
            : `Visitors per day vs Registrations per day (last ${rangeDays * 2} days)`}
        </div>
        <div className="barChart">
          {computed.chart.map((row) => {
            const vH = Math.round((row.visitors / computed.maxY) * 100);
            const rH = Math.round((row.registrations / computed.maxY) * 100);

            return (
              <div className="barCol" key={row.day} title={`${row.day}\nVisitors: ${row.visitors}\nRegistrations: ${row.registrations}`}>
                <div className="barStack">
                  <div className="bar barVisitors" style={{ height: `${vH}%` }} />
                  <div className="bar barRegs" style={{ height: `${rH}%` }} />
                </div>
                <div className="barLabel">{row.day.slice(5)}</div>
              </div>
            );
          })}
        </div>

        <div className="chartLegend">
          <span className="legendItem"><span className="legendSwatch visitors" /> Visitors</span>
          <span className="legendItem"><span className="legendSwatch regs" /> Registrations</span>
        </div>
      </div>
      {isRefreshing && (
        <div className="adminDashOverlay" aria-hidden="true">
          <div className="adminDashOverlay__pill">
            <span className="adminDashOverlay__spinner" />
            Updating {rangeDays === "all" ? "all-time" : `${rangeDays}d`} view
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
