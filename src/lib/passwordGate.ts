// Mini pub/sub para la "red de seguridad" del cambio de contraseña obligatorio.
// Cuando cualquier request responde 403 { detail: "Password change required" },
// se notifica aquí y el AuthProvider marca al usuario con mustChangePassword=true
// (lo que hace que ProtectedRoute muestre la pantalla de cambio).

type Listener = () => void;

let listener: Listener | null = null;

export function onPasswordChangeRequired(cb: Listener): () => void {
  listener = cb;
  return () => {
    if (listener === cb) listener = null;
  };
}

export function notifyPasswordChangeRequired(): void {
  listener?.();
}
