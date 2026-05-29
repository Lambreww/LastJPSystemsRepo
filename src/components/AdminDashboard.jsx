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
  { value: 1, label: "1 ден" },
  { value: 3, label: "3 дни" },
  { value: 7, label: "7 дни" },
  { value: "all", label: "Всичко" },
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

function rangeLabel(rangeDays, isAllTime) {
  if (isAllTime) return "общо";
  if (rangeDays === 1) return "1 ден";
  return `${rangeDays} дни`;
}

function compareLabel(rangeDays) {
  if (rangeDays === 1) return "предходния ден";
  return `предходните ${rangeDays} дни`;
}

function DonutChart({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 25;

  return (
    <div className="donutChart">
      <svg viewBox="0 0 42 42" role="img" aria-label={centerLabel}>
        <circle className="donutChart__track" cx="21" cy="21" r="15.915" />
        {total > 0 ? (
          segments.map((segment) => {
            const percent = (segment.value / total) * 100;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = offset;
            offset -= percent;

            return (
              <circle
                key={segment.label}
                className="donutChart__segment"
                cx="21"
                cy="21"
                r="15.915"
                stroke={segment.color}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })
        ) : (
          <circle
            className="donutChart__segment"
            cx="21"
            cy="21"
            r="15.915"
            stroke="#cbd5e1"
            strokeDasharray="100 0"
          />
        )}
      </svg>
      <div className="donutChart__center">
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rangeDays, setRangeDays] = useState(1);
  const hasLoadedRef = useRef(false);
  const [error, setError] = useState("");
  const [analyticsWarning, setAnalyticsWarning] = useState("");
  const [usersWarning, setUsersWarning] = useState("");

  const [events, setEvents] = useState([]); // analytics_events
  const [users, setUsers] = useState([]);   // users (registrations)
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const run = async () => {
      setError("");
      setAnalyticsWarning("");
      setUsersWarning("");
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
      const allUsersQ = query(collection(db, "users"));

      const [eventsResult, usersResult, allUsersResult] = await Promise.allSettled([
        getDocs(eventsQ),
        getDocs(usersQ),
        getDocs(allUsersQ),
      ]);

      const ev =
        eventsResult.status === "fulfilled"
          ? eventsResult.value.docs.map((d) => ({ id: d.id, ...d.data() }))
          : [];
      const us =
        usersResult.status === "fulfilled"
          ? usersResult.value.docs.map((d) => ({ id: d.id, ...d.data() }))
          : [];
      const allUs =
        allUsersResult.status === "fulfilled"
          ? allUsersResult.value.docs.map((d) => ({ id: d.id, ...d.data() }))
          : us;

      if (eventsResult.status === "rejected") {
        console.error("Analytics events load error:", eventsResult.reason);
        setAnalyticsWarning(
          "Нямаш достъп до analytics_events във Firestore. Посещенията, сесиите и топ страниците временно не могат да се заредят."
        );
      }

      if (usersResult.status === "rejected" || allUsersResult.status === "rejected") {
        console.error("Users load error:", usersResult.reason || allUsersResult.reason);
        setUsersWarning(
          "Нямаш достъп до users във Firestore. Регистрациите временно не могат да се заредят."
        );
      }

      setEvents(ev);
      setUsers(us);
      setAllUsers(allUs);
      setLoading(false);
      setIsRefreshing(false);
      hasLoadedRef.current = true;
    };

    run().catch((e) => {
      console.error("AdminDashboard load error:", e);
      setError(e?.message || "Неуспешно зареждане на анализите.");
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
    const totalAccounts = allUsers.length;

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
      const visitorIds = new Set();
      const visitorIdsPrev = new Set();

      for (const e of events) {
        if (!e.createdAt?.toDate || !e.visitorId) continue;
        const key = formatDayKey(e.createdAt.toDate());
        if (lastKeys.includes(key)) visitorIds.add(e.visitorId);
        if (prevKeys.includes(key)) visitorIdsPrev.add(e.visitorId);
      }

      uniqueVisitors = visitorIds.size;
      uniqueVisitorsPrev = visitorIdsPrev.size;

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

    const topPages = Object.entries(
      events.reduce((acc, event) => {
        if (event.type !== "pageview") return acc;
        const path = event.path || "/";
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const topPageMax = Math.max(1, ...topPages.map((page) => page.count));
    const pagesTotal = topPages.reduce((sum, page) => sum + page.count, 0);
    const avgPagesPerSession = sessions > 0 ? Math.round((pageviews / sessions) * 10) / 10 : 0;
    const returningVisits = Math.max(0, sessions - uniqueVisitors);
    const rawMixSegments = [
      { label: "Преглеждания", value: pageviews, color: "#f97316" },
      { label: "Сесии", value: sessions, color: "#111827" },
      { label: "Регистрации", value: regs, color: "#2563eb" },
    ];
    const trafficMix = rawMixSegments.some((segment) => segment.value > 0)
      ? rawMixSegments
      : [
          { label: "Преглеждания", value: 0, color: "#f97316" },
          { label: "Сесии", value: 0, color: "#111827" },
          { label: "Регистрации", value: 0, color: "#2563eb" },
        ];
    const audienceMix = [
      { label: "Уникални посетители", value: uniqueVisitors, color: "#16a34a" },
      { label: "Повторни посещения", value: returningVisits, color: "#7c3aed" },
    ];
    const conversionMix = [
      { label: "Регистрирани", value: regs, color: "#2563eb" },
      { label: "Без регистрация", value: Math.max(0, uniqueVisitors - regs), color: "#e2e8f0" },
    ];

    return {
      kpis: {
        uniqueVisitors,
        sessions,
        pageviews,
        regs,
        totalAccounts,
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
      topPages,
      topPageMax,
      pagesTotal,
      avgPagesPerSession,
      trafficMix,
      audienceMix,
      conversionMix,
    };
  }, [allUsers, events, rangeDays, users]);

  if (loading) {
    return <div className="adminDash">Зареждане на статистики…</div>;
  }

  return (
    <div className="adminDash">
      <div className="adminDashTop">
        <div>
          <h2 className="adminDashTitle">Анализи на сайта</h2>
          <p className="adminDashSubtitle">Данните се зареждат от Firestore: посещения, сесии, страници и регистрации.</p>
        </div>

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

      {error && <div className="adminDashError">{error}</div>}
      {analyticsWarning && <div className="adminDashWarning">{analyticsWarning}</div>}
      {usersWarning && <div className="adminDashWarning">{usersWarning}</div>}

      <div className={`adminDashBody ${isRefreshing ? "is-refreshing" : ""}`}>
      <div className="kpiGrid">
        <div className="kpiCard">
          <div className="kpiLabel">Уникални посетители ({rangeLabel(rangeDays, computed.isAllTime)})</div>
          <div className="kpiValue">{computed.kpis.uniqueVisitors}</div>
          {computed.compare.uniqueVisitors !== null && (
            <div className={`kpiDelta ${computed.compare.uniqueVisitors >= 0 ? "up" : "down"}`}>
              {computed.compare.uniqueVisitors >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.uniqueVisitors)}% спрямо {compareLabel(rangeDays)}
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Сесии/посещения ({rangeLabel(rangeDays, computed.isAllTime)})</div>
          <div className="kpiValue">{computed.kpis.sessions}</div>
          {computed.compare.sessions !== null && (
            <div className={`kpiDelta ${computed.compare.sessions >= 0 ? "up" : "down"}`}>
              {computed.compare.sessions >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.sessions)}% спрямо {compareLabel(rangeDays)}
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Преглеждания на страници ({rangeLabel(rangeDays, computed.isAllTime)})</div>
          <div className="kpiValue">{computed.kpis.pageviews}</div>
          {computed.compare.pageviews !== null && (
            <div className={`kpiDelta ${computed.compare.pageviews >= 0 ? "up" : "down"}`}>
              {computed.compare.pageviews >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.pageviews)}% спрямо {compareLabel(rangeDays)}
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Нови регистрации ({rangeLabel(rangeDays, computed.isAllTime)})</div>
          <div className="kpiValue">{computed.kpis.regs}</div>
          {computed.compare.regs !== null && (
            <div className={`kpiDelta ${computed.compare.regs >= 0 ? "up" : "down"}`}>
              {computed.compare.regs >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.regs)}% спрямо {compareLabel(rangeDays)}
            </div>
          )}
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Общо акаунти</div>
          <div className="kpiValue">{computed.kpis.totalAccounts}</div>
          <div className="kpiDelta">Всички регистрирани потребители</div>
        </div>

        <div className="kpiCard">
          <div className="kpiLabel">Конверсия ({rangeLabel(rangeDays, computed.isAllTime)})</div>
          <div className="kpiValue">{computed.kpis.conv}%</div>
          {computed.compare.conv !== null && (
            <div className={`kpiDelta ${computed.compare.conv >= 0 ? "up" : "down"}`}>
              {computed.compare.conv >= 0 ? "▲" : "▼"} {Math.abs(computed.compare.conv)}% спрямо {compareLabel(rangeDays)}
            </div>
          )}
        </div>
      </div>

      <div className="insightGrid">
        <div className="chartCard insightCard">
          <div className="chartTitle">Разпределение на трафика</div>
          <DonutChart
            segments={computed.trafficMix}
            centerValue={computed.kpis.pageviews}
            centerLabel="преглеждания"
          />
          <div className="donutLegend">
            {computed.trafficMix.map((segment) => (
              <span key={segment.label} className="legendItem">
                <span className="legendSwatch" style={{ background: segment.color }} />
                {segment.label}: {segment.value}
              </span>
            ))}
          </div>
        </div>

        <div className="chartCard insightCard">
          <div className="chartTitle">Аудитория</div>
          <DonutChart
            segments={computed.audienceMix}
            centerValue={computed.kpis.sessions}
            centerLabel="сесии"
          />
          <div className="donutLegend">
            {computed.audienceMix.map((segment) => (
              <span key={segment.label} className="legendItem">
                <span className="legendSwatch" style={{ background: segment.color }} />
                {segment.label}: {segment.value}
              </span>
            ))}
          </div>
        </div>

        <div className="chartCard insightCard">
          <div className="chartTitle">Фуния на регистрациите</div>
          <DonutChart
            segments={computed.conversionMix}
            centerValue={`${computed.kpis.conv}%`}
            centerLabel="конверсия"
          />
          <div className="funnelStats">
            <div>
              <strong>{computed.kpis.uniqueVisitors}</strong>
              <span>посетители</span>
            </div>
            <div>
              <strong>{computed.kpis.regs}</strong>
              <span>регистрации</span>
            </div>
            <div>
              <strong>{computed.avgPagesPerSession}</strong>
              <span>страници/сесия</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chartCard">
        <div className="chartTitle">
          {computed.isAllTime
            ? "Посетители и регистрации по дни (последни 14 дни)"
            : `Посетители и регистрации по дни (последни ${rangeDays * 2} дни)`}
        </div>
        <div className="barChart">
          {computed.chart.map((row) => {
            const vH = Math.round((row.visitors / computed.maxY) * 100);
            const rH = Math.round((row.registrations / computed.maxY) * 100);

            return (
              <div className="barCol" key={row.day} title={`${row.day}\nПосетители: ${row.visitors}\nРегистрации: ${row.registrations}`}>
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
          <span className="legendItem"><span className="legendSwatch visitors" /> Посетители</span>
          <span className="legendItem"><span className="legendSwatch regs" /> Регистрации</span>
        </div>
      </div>

      <div className="adminDashSplit adminDashSplit--single">
        <div className="chartCard">
          <div className="chartTitle">Най-посещавани страници</div>
          {computed.topPages.length === 0 ? (
            <div className="adminDashEmpty">Няма записани преглеждания за избрания период.</div>
          ) : (
            <div className="topPagesList">
              {computed.topPages.map((row) => {
                const width = Math.max(7, Math.round((row.count / computed.topPageMax) * 100));
                const pct = computed.pagesTotal > 0 ? Math.round((row.count / computed.pagesTotal) * 100) : 0;

                return (
                  <div className="topPageRow" key={row.path}>
                    <div className="topPageMeta">
                      <span>{row.path}</span>
                      <strong>{row.count} преглеждания · {pct}%</strong>
                    </div>
                    <div className="topPageTrack">
                      <span style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {isRefreshing && (
        <div className="adminDashOverlay" aria-hidden="true">
          <div className="adminDashOverlay__pill">
            <span className="adminDashOverlay__spinner" />
            Обновяване на {rangeLabel(rangeDays, rangeDays === "all")} изгледа
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
