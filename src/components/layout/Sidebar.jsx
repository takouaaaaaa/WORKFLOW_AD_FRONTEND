import { NavLink } from "react-router-dom";
import { ROLES } from "../../app/routeConfig";

export default function Sidebar({ roles }) {
  const role = roles?.[0];

  let items = [];

  if (role === ROLES.ADMIN) {
    items = [
      { label: "Dashboard", path: "/admin" },
      { label: "Users", path: "/admin/users" },
      { label: "Senders", path: "/admin/senders" },
      { label: "Receivers", path: "/admin/receivers" },
      { label: "Type Flux", path: "/admin/typeflux" },
      { label: "File IN", path: "/admin/file-in" },
      { label: "File OUT", path: "/admin/file-out" },
    ];
  } else if (role === ROLES.USER_FONCTIONNEL) {
    items = [
    { label: "Dashboard", path: "/fonctionnel" },
      { label: "File IN", path: "/fonctionnel/file-in" },
      { label: "File OUT", path: "/fonctionnel/file-out" },
    ];
  } else if (role === ROLES.USER_TECHNIQUE) {
    items = [
      { label: "Dashboard", path: "/technique" },
      { label: "Senders", path: "/technique/senders" },
      { label: "Receivers", path: "/technique/receivers" },
      { label: "Type Flux", path: "/technique/typeflux" },
    ];
  }

  return (
    <div className="palm-sidebar">
      <div className="palm-sidebar-section"></div>

      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "palm-nav-item active" : "palm-nav-item"
          }
        >
          {item.label}
        </NavLink>
      ))}

    </div>
  );
}