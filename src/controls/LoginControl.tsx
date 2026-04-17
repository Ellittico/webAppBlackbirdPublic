import { type RegisterDatarRequest, type LoginDataRequest } from "../types/auth.types";

// VALIDAZIONE LOGIN
export function validateLogin({ email, password }: LoginDataRequest) {
  const errors: string[] = [];

  if (!email.trim()) errors.push("Inserisci l'email.");
  if (!email.includes("@")) errors.push("Email non valida.");
  if (!password.trim()) errors.push("Inserisci la password.");

  return errors;
}

// VALIDAZIONE REGISTRAZIONE
export async function validateRegister(data: RegisterDatarRequest): Promise<string[]> {
  const errors: string[] = [];

  // EMAIL
  if (!validateEmail(data.email)) {
    errors.push("Email non valida.");
  }

  // EMAIL DOMINIO
  const mxOk = await validateEmailMX(data.email);
  if (!mxOk)
  errors.push("Il dominio email non esiste.");

  // PASSWORD
  const passErrors = validatePassword(data.password);
  errors.push(...passErrors);

  // PASSWORD MATCH
  if (data.password !== data.confirmPassword) {
    errors.push("Le password non coincidono.");
  }

  return errors;
}

// VALIDAZIONE EMAIL
export function validateEmail(email: string): boolean {
  // Controllo robusto: nome@dominio.estensione
  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  return emailRegex.test(email);
}

// VALIDAZIONE MX LOOK-UP
export async function validateEmailMX(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`
    );
    const data = await res.json();

    return !!data.Answer; // true se esistono MX
  } catch {
    return false;
  }
}

// CONTROLLO INJECTIONS
export function containsSQLInjection(value: string): boolean {
  const forbidden = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "CREATE",
    "--",
    ";",
    "'",
    "\"",
    "/*",
    "*/",
  ];

  return forbidden.some((f) =>
    value.toUpperCase().includes(f)
  );
}

// VALIDAZIONE PASSWORD
export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8)
    errors.push("La password deve avere almeno 8 caratteri.");

  if (!/[A-Z]/.test(password))
    errors.push("La password deve contenere almeno una lettera maiuscola.");

  if (!/[0-9]/.test(password))
    errors.push("La password deve contenere almeno un numero.");

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    errors.push("La password deve contenere almeno un carattere speciale.");

  if (containsSQLInjection(password))
    errors.push("La password contiene caratteri non permessi.");

  return errors;
}

// CONTROLLO PASSWORD COMPROMESSE TO DO


// CREAZIONE OGGETTO LOGIN
export function prepareLoginData(email: string, password: string): LoginDataRequest {
  return { email, password };
}

// CREAZIONE OGGETTO REGISTRAZIONE
export function prepareRegisterData(
  email: string,
  password: string,
  confirmPassword: string
): RegisterDatarRequest {
  return {email, password, confirmPassword };
}
