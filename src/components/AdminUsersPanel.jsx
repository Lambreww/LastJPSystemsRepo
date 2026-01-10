import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import "./AdminUsersPanel.css";

const AdminUsersPanel = ({ onClose }) => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [savingUid, setSavingUid] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isSuperAdmin = useMemo(() => {
    return (
      user?.role === "admin" &&
      (user?.email ?? "").toLowerCase() === "lambreww@gmail.com"
    );
  }, [user]);

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
    if (isSuperAdmin) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const changeRole = async (targetUid, newRole) => {
    setError("");
    setSavingUid(targetUid);
    try {
      const target = users.find((u) => u.uid === targetUid);
      const myEmail = (user?.email ?? "").toLowerCase();

      // за да не си махнеш админа случайно
      if ((target?.email ?? "").toLowerCase() === myEmail && newRole !== "admin") {
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

  if (!isSuperAdmin) {
    return (
      <div className="admin-users-panel">
        <div className="access-denied">
          <h3>🔒 Достъп отказан</h3>
          <p>Само администраторът (lambreww@gmail.com) има достъп до този панел.</p>
        </div>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || (u.role ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="admin-users-panel">
      <div className="admin-header">
        <h2>Управление на потребители</h2>
        <p>Сменяй роли (user/admin) директно от сайта.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Търси по име, имейл или роля..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="refresh-btn" onClick={loadUsers} disabled={loadingList || savingUid}>
          {loadingList ? "Зареждане..." : "Обнови"}
        </button>
      </div>

      <div className="table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Име</th>
              <th>Имейл</th>
              <th>Роля</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={4} className="center">Зареждане...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="center">Няма резултати.</td>
              </tr>
            ) : (
              filtered.map((u) => {
                const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "-";
                const role = u.role ?? "user";
                return (
                  <tr key={u.uid}>
                    <td>{fullName}</td>
                    <td>{u.email ?? "-"}</td>
                    <td>
                      <span className={`role-pill ${role === "admin" ? "admin" : "user"}`}>
                        {role}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="role-btn"
                        disabled={savingUid === u.uid}
                        onClick={() => changeRole(u.uid, "user")}
                      >
                        Make user
                      </button>
                      <button
                        className="role-btn primary"
                        disabled={savingUid === u.uid}
                        onClick={() => changeRole(u.uid, "admin")}
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

      <div className="admin-actions">
        <button className="close-btn" onClick={onClose}>Затвори</button>
      </div>
    </div>
  );
};

export default AdminUsersPanel;
