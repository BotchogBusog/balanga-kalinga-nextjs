// Shared input validation for account forms. Server actions use these checks
// as the source of truth; matching HTML attributes provide immediate feedback.
export const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
export const ID_PATTERN = /^\d+(?:-\d+)*$/;
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function isLetterField(value) {
  return !value || NAME_PATTERN.test(value.trim());
}

export function isStudentId(value) {
  return !value || ID_PATTERN.test(value.trim());
}

export function isLoginValue(value) {
  const login = value.trim();
  return EMAIL_PATTERN.test(login) || ID_PATTERN.test(login);
}
