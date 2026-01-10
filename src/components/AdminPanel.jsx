import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [savingUid, setSavingUid] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setError("");
    setLoadingList(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      setUsers(list);
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRole = async (targetUid, newRole) => {
    setError("");
    setSavingUid(targetUid);
    try {
      // ✅ защита: да не си махнеш админа (по UID)
      if (targetUid === user?.uid && newRole !== "admin") {
        setError("Не можеш да премахнеш админ правата на собствения си акаунт.");
        return;
      }

      await updateDoc(doc(db, "users", targetUid), { role: newRole });
      await loadUsers();
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={topRow}>
          <div>
            <h1 style={title}>Admin Panel</h1>
            <p style={subtitle}>Управление на роли, потребители и анализи</p>
            <AdminDashboard />
          </div>

          <button
            onClick={loadUsers}
            disabled={loadingList || !!savingUid}
            style={{
              ...btn,
              ...(loadingList || savingUid ? btnDisabled : {}),
            }}
          >
            {loadingList ? "Зареждане..." : "Обнови"}
          </button>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Име</th>
                <th style={th}>Имейл</th>
                <th style={th}>Роля</th>
                <th style={{ ...th, textAlign: "right" }}>Действия</th>
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                <tr>
                  <td style={tdMuted} colSpan={4}>
                    Зареждане...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td style={tdMuted} colSpan={4}>
                    Няма потребители.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
                  const role = (u.role || "user").toLowerCase();
                  const isMe = u.uid === user?.uid;

                  return (
                    <tr key={u.uid} style={row}>
                      <td style={td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={nameText}>{fullName || "-"}</span>
                          {isMe && <span style={meBadge}>Това си ти</span>}
                        </div>
                      </td>

                      <td style={td}>
                        <span style={emailText}>{u.email || "-"}</span>
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            ...roleBadge,
                            ...(role === "admin" ? roleAdmin : roleUser),
                          }}
                        >
                          {role}
                        </span>
                      </td>

                      <td style={{ ...td, textAlign: "right" }}>
                        <button
                          disabled={savingUid === u.uid || (isMe && role === "admin")}
                          onClick={() => changeRole(u.uid, "user")}
                          style={{
                            ...btnSmall,
                            ...btnGhost,
                            ...(savingUid === u.uid || (isMe && role === "admin")
                              ? btnDisabled
                              : {}),
                          }}
                          title={isMe ? "Не можеш да се направиш user" : "Направи user"}
                        >
                          Make user
                        </button>

                        <button
                          disabled={savingUid === u.uid}
                          onClick={() => changeRole(u.uid, "admin")}
                          style={{
                            ...btnSmall,
                            ...btnPrimary,
                            ...(savingUid === u.uid ? btnDisabled : {}),
                          }}
                        >
                          Make admin
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={hint}>
          Влизаш като: <b>{user?.email || "-"}</b>
        </div>
      </div>
    </div>
  );
}

/* =======================
   Styles (dark-friendly)
   ======================= */

const page = {
  padding: 24,
  maxWidth: 1100,
  margin: "0 auto",
};

const card = {
  borderRadius: 16,
  padding: 18,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(6px)",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const title = {
  margin: 0,
  fontSize: 22,
  color: "rgba(255,255,255,0.95)",
};

const subtitle = {
  margin: "6px 0 0",
  color: "rgba(255,255,255,0.70)",
  fontSize: 14,
};

const errorBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255, 90, 90, 0.55)",
  background: "rgba(255, 90, 90, 0.12)",
  color: "rgba(255,255,255,0.92)",
};

const tableWrap = {
  marginTop: 14,
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.25)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: 12,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.2,
  color: "rgba(255,255,255,0.78)",
  background: "rgba(255,255,255,0.06)",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
};

const td = {
  padding: 12,
  color: "rgba(255,255,255,0.88)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  verticalAlign: "middle",
};

const tdMuted = {
  ...td,
  color: "rgba(255,255,255,0.70)",
  textAlign: "center",
  padding: 18,
};

const row = {
  background: "transparent",
};

const nameText = {
  fontWeight: 700,
  color: "rgba(255,255,255,0.92)",
};

const emailText = {
  color: "rgba(255,255,255,0.80)",
  fontSize: 14,
};

const meBadge = {
  display: "inline-flex",
  alignSelf: "flex-start",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  color: "rgba(255,255,255,0.78)",
  background: "rgba(255,255,255,0.06)",
};

const roleBadge = {
  display: "inline-flex",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 13,
  border: "1px solid rgba(255,255,255,0.16)",
  textTransform: "lowercase",
};

const roleAdmin = {
  background: "rgba(255, 149, 0, 0.16)", // оранжево
  border: "1px solid rgba(255, 149, 0, 0.35)",
  color: "rgba(255,255,255,0.92)",
};

const roleUser = {
  background: "rgba(0, 180, 255, 0.14)", // синьо
  border: "1px solid rgba(0, 180, 255, 0.30)",
  color: "rgba(255,255,255,0.90)",
};

const btn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontWeight: 700,
};

const btnSmall = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  cursor: "pointer",
  fontWeight: 700,
  color: "rgba(255,255,255,0.92)",
  marginLeft: 8,
};

const btnPrimary = {
  background: "rgba(255,149,0,0.22)",
  border: "1px solid rgba(255,149,0,0.40)",
};

const btnGhost = {
  background: "rgba(255,255,255,0.06)",
};

const btnDisabled = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const hint = {
  marginTop: 12,
  color: "rgba(255,255,255,0.65)",
  fontSize: 13,
};
