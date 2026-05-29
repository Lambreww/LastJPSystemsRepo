import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import AdminGalleryPanel from "./AdminGalleryPanel";
import AdminUsersPanel from "./AdminUsersPanel";
import "./AdminPanel.css";

const ADMIN_SECTIONS = [
  {
    id: "analytics",
    label: "Анализи",
    description: "Посещения, сесии и регистрации",
    icon: "A",
    component: AdminDashboard,
  },
  {
    id: "gallery",
    label: "Галерия",
    description: "Добавяне и редакция на продукти",
    icon: "G",
    component: AdminGalleryPanel,
  },
  {
    id: "users",
    label: "Потребители",
    description: "Роли и достъп",
    icon: "U",
    component: AdminUsersPanel,
  },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = useMemo(() => {
    return ADMIN_SECTIONS.find((section) => section.id === activeSection) ?? ADMIN_SECTIONS[0];
  }, [activeSection]);

  const CurrentComponent = current.component;

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  return (
    <div className="adminShell">
      <aside className={`adminShell__sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="adminShell__brand">
          <div>
            <span className="adminShell__eyebrow">JP Systems</span>
            <h1>Admin</h1>
          </div>
          <button
            className="adminShell__iconBtn adminShell__close"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Затвори менюто"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="adminShell__nav" aria-label="Admin меню">
          {ADMIN_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                className={`adminShell__navItem ${isActive ? "is-active" : ""}`}
                onClick={() => selectSection(section.id)}
              >
                <span className="adminShell__navIcon" aria-hidden="true">{section.icon}</span>
                <span>
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="adminShell__account">
          <div>
            <span>Влязъл като</span>
            <strong>{user?.email || "-"}</strong>
          </div>
          <button className="adminShell__logout" type="button" onClick={logout}>
            Изход
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="adminShell__scrim"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Затвори менюто"
        />
      )}

      <section className="adminShell__main">
        <header className="adminShell__topbar">
          <button
            className="adminShell__iconBtn"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Отвори менюто"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <div>
            <span className="adminShell__eyebrow">Администрация</span>
            <h2>{current.label}</h2>
          </div>
        </header>

        <div className="adminShell__content">
          <CurrentComponent />
        </div>
      </section>
    </div>
  );
}
