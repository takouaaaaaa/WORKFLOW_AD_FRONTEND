export const ROLES = {
  ADMIN: "ADMIN",
  USER_TECHNIQUE: "USER_TECHNIQUE",
  USER_FONCTIONNEL: "USER_FONCTIONNEL",
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.USER_TECHNIQUE]: "/technique",
  [ROLES.USER_FONCTIONNEL]: "/fonctionnel",
};

export const MENU_BY_ROLE = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", path: "/admin" },
    { label: "Users", path: "/admin/users" },
    { label: "Senders", path: "/admin/senders" },
    { label: "Receivers", path: "/admin/receivers" },
    { label: "Type Flux", path: "/admin/typeflux" },
    { label: "Flux", path: "/admin/flux" },
    { label: "File IN", path: "/admin/file-in" },
    { label: "File OUT", path: "/admin/file-out" },
  ],

  [ROLES.USER_TECHNIQUE]: [
    { label: "Dashboard", path: "/technique" },
    { label: "Senders", path: "/technique/senders" },
    { label: "Receivers", path: "/technique/receivers" },
    { label: "Type Flux", path: "/technique/typeflux" },
  ],

  [ROLES.USER_FONCTIONNEL]: [
    { label: "Dashboard", path: "/fonctionnel" },
    { label: "Flux", path: "/fonctionnel/flux" },
    { label: "File IN", path: "/fonctionnel/file-in" },
    { label: "File OUT", path: "/fonctionnel/file-out" },
  ],
};