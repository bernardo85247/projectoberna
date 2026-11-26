// Roles, módulos y qué módulos se pueden asignar a cada rol.
export const ROLES = { patient: 'Paciente', admin: 'Admin', superadmin: 'Super admin' };

export const MODULOS = {
  buscar:   { label: 'Buscar y descargar', href: '/portal' },
  subir:    { label: 'Subir resultados',   href: '/admin' },
  permisos: { label: 'Permisos',           href: '/permisos' },
};

// Lo máximo que cada rol puede llegar a tener (el superadmin siempre tiene todo).
export const PERMITIDOS = {
  patient: ['buscar'],
  admin: ['buscar', 'subir'],
  superadmin: ['buscar', 'subir', 'permisos'],
};
