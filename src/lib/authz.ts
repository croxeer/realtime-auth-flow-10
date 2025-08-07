export const ADMIN_EMAILS: string[] = [
  'admin@demo.local',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}