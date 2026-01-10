import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import "./AdminDashboard.css";

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

  const [events, setEvents] = useState([]); // analytics_events
  const [users, setUsers] = useState([]);   // users (registrations)

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // последни 14 дни (за да имаме 7d + prev 7d)
      const today = startOfDay(new Date());
      const from14 = addDays(today, -13); // включително днес = 14 дни
      const fromTs = Timestamp.fromDate(from14);

      const eventsQ = query(
        collection(db, "analytics_events"),
        where("createdAt", ">=", fromTs)
      );

      const usersQ = query(
        collection(db, "users"),
        where("createdAt", ">=", fromTs)
      );

      const [eventsSnap, usersSnap] = await Promise.all([
        getDocs(eventsQ),
        getDocs(usersQ),
      ]);

      const ev = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const us = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setEvents(ev);
      setUsers(us);
      setLoading(false);
    };

    run().catch((e) => {
      console.error("AdminDashboard load error:", e);
      setLoading(false);
    });
  }, []);

  const computed = useMemo(() => {
    const today = startOfDay(new Date());
    const dayKeys = Array.from({ length: 14 }, (_, i) =>
      formatDayKey(addDays(today, -13 + i))
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

    const last7Keys = dayKeys.slice(7);      // последните 7 дни
    const prev7Keys = dayKeys.slice(0, 7);   // предходните 7 дни

    const uniqueVisitors7 = sumRange(visitorsByDay, last7Keys);
    const uniqueVisitorsPrev7 = sumRange(visitorsByDay, prev7Keys);

    const pageviews7 = sumRange(pageviewsByDay, last7Keys);
    const pageviewsPrev7 = sumRange(pageviewsByDay, prev7Keys);

    const sessions7 = last7Keys.reduce((s, k) => s + sessionSets[k].size, 0);
    const sessionsPrev7 = prev7Keys.reduce((s, k) => s + sessionSets[k].size, 0);

    const regs7 = sumRange(regsByDay, last7Keys);
    const regsPrev7 = sumRange(regsByDay, prev7Keys);

    const conv7 = uniqueVisitors7 > 0 ? Math.round((regs7 / uniqueVisitors7) * 1000) / 10 : 0;
    const convPrev7 = uniqueVisitorsPrev7 > 0 ? Math.round((regsPrev7 / uniqueVisitorsPrev7) * 1000) / 10 : 0;

    // за графика: последните 14 дни
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
        uniqueVisitors7,
        sessions7,
        pageviews7,
        regs7,
        conv7,
      },
      compare: {
        uniqueVisitors: pctChange(uniqueVisitors7, uniqueVisitorsPrev7),
        sessions: pctChange(sessions7, sessionsPrev7),
        pageviews: pctChange(pageviews7, pageviewsPrev7),
        regs: pctChange(regs7, regsPrev7),
        conv: pctChange(conv7, convPrev7),
      },
      chart,
      maxY,
    };
  }, [events, users]);

  if (loading) {
    return <div className="adminDash">Зареждане на статистики…</div>;
  }

  return (
    <div className="adminDash">
      <h2 className="adminDashTitle">Dashboard</h2>

      <div className="kpiGrid">
        <div className="kpiCard">
          <div className="kpiLabel">Unique visitors (7d)</div>
          <div className="kpiValue">{computed.kpis.uniqueVisitors7}</div>
          <div className={`kpiDelta ${computed.compare.uniqueVisitors >= 0 ? "up" : "down"}`}>
            {computed.compare.uniqueVisitors >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.uniqueVisitors)}% vs prev 7d
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Sessions/Visits (7d)</div>
          <div className="kpiValue">{computed.kpis.sessions7}</div>
          <div className={`kpiDelta ${computed.compare.sessions >= 0 ? "up" : "down"}`}>
            {computed.compare.sessions >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.sessions)}% vs prev 7d
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Pageviews (7d)</div>
          <div className="kpiValue">{computed.kpis.pageviews7}</div>
          <div className={`kpiDelta ${computed.compare.pageviews >= 0 ? "up" : "down"}`}>
            {computed.compare.pageviews >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.pageviews)}% vs prev 7d
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Registrations (7d)</div>
          <div className="kpiValue">{computed.kpis.regs7}</div>
          <div className={`kpiDelta ${computed.compare.regs >= 0 ? "up" : "down"}`}>
            {computed.compare.regs >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.regs)}% vs prev 7d
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Conversion rate (7d)</div>
          <div className="kpiValue">{computed.kpis.conv7}%</div>
          <div className={`kpiDelta ${computed.compare.conv >= 0 ? "up" : "down"}`}>
            {computed.compare.conv >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.conv)}% vs prev 7d
          </div>
        </div>
      </div>

      <div className="chartCard">
        <div className="chartTitle">Visitors per day vs Registrations per day (last 14 days)</div>
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
    </div>
  );
}
