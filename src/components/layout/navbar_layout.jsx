import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import { authService } from "../../services/authService";

export const InstitutionalNavbar = ({
  menuItems = [],
  roleTitle = "Panel de Control",
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Manejador centralizado de cierre de sesión
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Limpieza garantizada y redirección al inicio
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  const toggleMobileDropdown = (key) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 font-sans text-slate-800">
      {/* Animaciones */}
      <style>{`
        @keyframes navReveal {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPop {
          0% { opacity: 0; transform: scale(0.3) rotate(-8deg); }
          60% { opacity: 1; transform: scale(1.12) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes itemEnter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mobileDrawer {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .navbar-enter { animation: navReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .logo-enter { animation: logoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both; }
        .item-enter { animation: itemEnter 0.35s ease-out both; }
        .dropdown-menu { animation: dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: top left; }
        .mobile-drawer { animation: mobileDrawer 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .navbar-enter, .logo-enter, .item-enter, .dropdown-menu, .mobile-drawer {
            animation: none;
            transform: none;
          }
        }
      `}</style>

      {/* Cabecera Principal */}
      <header className="navbar-enter sticky top-0 z-50 w-full overflow-hidden  border-b border-slate-800/80 bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] text-white shadow-2xl shadow-slate-950/40">
        {/* Marca de agua de fondo */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <span
            className="absolute -right-6 -top-10 text-[9rem] font-black italic leading-none tracking-tighter text-white/[0.035] sm:text-[11rem]"
            aria-hidden="true"
          >
            SUMO
          </span>
          <div className="absolute -top-24 right-1/4 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        {/* Nivel Superior */}
        <div className="relative flex h-[74px] w-full items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <div className="logo-enter relative shrink-0 rounded-2xl bg-gradient-to-br from-amber-400/30 to-transparent p-[2px] shadow-lg shadow-amber-500/20">
              <img
                src="/logo_sumo.png"
                alt="Consultora SUMO"
                className="h-11 w-11 rounded-[14px] object-cover ring-1 ring-white/10"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-xl font-bold tracking-wide text-white">
                SUMO
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
                {roleTitle}
                <span className="inline-block h-1 w-1 rounded-full bg-amber-400/70" />
                Sucursal La Paz
              </span>
            </div>
          </div>

          {/* Botón Cerrar Sesión Rápido (Desktop) */}
          <div className="hidden lg:flex">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-white/5 px-4 py-2 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <LogOut size={17} />
              <span>Cerrar sesión</span>
            </button>
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 lg:hidden"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Nivel Inferior: Barra de Navegación Horizontal (Desktop) */}
        <div className="relative hidden w-full border-t border-slate-800/60 bg-[#0B1120]/90 backdrop-blur-md lg:block">
          <div className="flex w-full items-center justify-between px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const hasChildren = Boolean(
                  item.children && item.children.length,
                );

                return (
                  <div
                    key={item.link || item.name}
                    className="relative"
                    onMouseEnter={() =>
                      hasChildren && setActiveDropdown(item.name)
                    }
                    onMouseLeave={() => hasChildren && setActiveDropdown(null)}
                  >
                    {hasChildren ? (
                      <button
                        className={`item-enter group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          activeDropdown === item.name
                            ? "bg-amber-400/[0.12] text-amber-400 shadow-inner shadow-amber-500/10 ring-1 ring-amber-400/30"
                            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                        }`}
                        style={{ animationDelay: `${0.1 + index * 0.04}s` }}
                      >
                        {Icon && (
                          <Icon
                            size={18}
                            className={
                              activeDropdown === item.name
                                ? "text-amber-400"
                                : "text-slate-500 transition-colors group-hover:text-amber-400/80"
                            }
                          />
                        )}
                        <span>{item.name}</span>
                        <ChevronDown
                          size={14}
                          className={`mt-0.5 transition-transform duration-200 ${
                            activeDropdown === item.name
                              ? "rotate-180 text-amber-400"
                              : "text-slate-500"
                          }`}
                        />
                      </button>
                    ) : (
                      <NavLink
                        to={item.link}
                        className={({ isActive }) =>
                          `item-enter group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                            isActive
                              ? "bg-amber-400/[0.12] text-amber-400 shadow-inner shadow-amber-500/10 ring-1 ring-amber-400/30"
                              : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          }`
                        }
                        style={{ animationDelay: `${0.1 + index * 0.04}s` }}
                      >
                        {({ isActive }) => (
                          <>
                            {Icon && (
                              <Icon
                                size={18}
                                className={
                                  isActive
                                    ? "text-amber-400"
                                    : "text-slate-500 transition-colors group-hover:text-amber-400/80"
                                }
                              />
                            )}
                            <span>{item.name}</span>
                          </>
                        )}
                      </NavLink>
                    )}

                    {/* Dropdown Desktop */}
                    {hasChildren && activeDropdown === item.name && (
                      <div className="dropdown-menu absolute left-1/2 top-[calc(100%+10px)] z-50 min-w-[240px] -translate-x-1/2 rounded-2xl border border-slate-800 bg-[#0F172A] p-2 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-lg">
                        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-slate-800 bg-[#0F172A]" />
                        <div className="relative">
                          {item.children.map((sub) => (
                            <NavLink
                              key={sub.link}
                              to={sub.link}
                              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-300 transition-colors duration-150 hover:bg-amber-400/10 hover:text-amber-400"
                            >
                              <span className="h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                              {sub.name}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer relative w-full rounded-b-[28px] border-t border-slate-800 bg-[#0B1120]/95 px-4 py-4 backdrop-blur-md lg:hidden">
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(
                  item.children && item.children.length,
                );

                return (
                  <div key={item.link || item.name} className="rounded-xl">
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleMobileDropdown(item.name)}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                            activeDropdown === item.name
                              ? "bg-amber-400/10 text-amber-400"
                              : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {Icon && (
                              <Icon
                                size={18}
                                className={
                                  activeDropdown === item.name
                                    ? "text-amber-400"
                                    : "text-slate-500"
                                }
                              />
                            )}
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform text-slate-400 ${
                              activeDropdown === item.name
                                ? "rotate-180 text-amber-400"
                                : ""
                            }`}
                          />
                        </button>
                        {activeDropdown === item.name && (
                          <div className="mt-1 space-y-1 rounded-xl bg-white/[0.03] py-1.5 pl-9 pr-2">
                            {item.children.map((sub) => (
                              <NavLink
                                key={sub.link}
                                to={sub.link}
                                onClick={closeMobileMenu}
                                className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-amber-400"
                              >
                                {sub.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.link}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-amber-400/[0.12] text-white ring-1 ring-amber-400/30"
                              : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {Icon && (
                              <Icon
                                size={18}
                                className={
                                  isActive ? "text-amber-400" : "text-slate-500"
                                }
                              />
                            )}
                            <span>{item.name}</span>
                          </>
                        )}
                      </NavLink>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-white/10 pt-3">
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenedor Principal de Vistas */}
      <main className="flex-1 w-full h-screen ">
        <div className="no-scrollbar h-screen  mx-auto rounded-3xl bg-white/60 p-4 shadow-xl shadow-orange-900/5 ring-1 ring-white/60 backdrop-blur-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
