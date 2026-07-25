import type { AlertButton, AlertOptions, DialogState } from "../components/ui/Dialog";

// ─── Internal subscriber ──────────────────────────────────────────────────────
// The root <DialogProvider> in _layout.tsx subscribes here so it can update
// its own state whenever Dialog.alert() / prompt() / etc. is called.

type Subscriber = (state: DialogState) => void;

let _subscriber: Subscriber | null = null;
let _dismissCallback: (() => void) | null = null;

function subscribe(fn: Subscriber) {
  _subscriber = fn;
}

function setDismissCallback(fn: () => void) {
  _dismissCallback = fn;
}

function dismiss() {
  _dismissCallback?.();
}

// ─── Public API (same surface as React Native's Alert) ────────────────────────

/**
 * Show a dialog with a title, optional message, and one or more buttons.
 *
 * @example
 * Dialog.alert("Delete item?", "This cannot be undone.", [
 *   { text: "Cancel",  style: "cancel" },
 *   { text: "Delete",  style: "destructive", onPress: () => handleDelete() },
 * ]);
 */
function alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
): void {
  if (!_subscriber) {
    console.warn("[Dialog] No subscriber found. Did you add <DialogProvider> to _layout.tsx?");
    return;
  }

  const resolvedButtons: AlertButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: "OK", style: "default" }];

  _subscriber({
    visible: true,
    title,
    message,
    buttons: resolvedButtons,
    options,
  });
}

/**
 * Convenience: simple OK / Cancel confirmation.
 *
 * @returns void — results are handled via onConfirm / onCancel callbacks.
 *
 * @example
 * Dialog.confirm(
 *   "Log out?",
 *   "You will need to sign in again.",
 *   { onConfirm: handleLogout }
 * );
 */
function confirm(
  title: string,
  message?: string,
  {
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText  = "Cancel",
    destructive = false,
    options,
  }: {
    onConfirm?:   () => void;
    onCancel?:    () => void;
    confirmText?: string;
    cancelText?:  string;
    destructive?: boolean;
    options?:     AlertOptions;
  } = {}
): void {
  alert(
    title,
    message,
    [
      { text: cancelText,  style: "cancel",      onPress: onCancel },
      { text: confirmText, style: destructive ? "destructive" : "default", onPress: onConfirm, isPreferred: true },
    ],
    { icon: "question", ...options }
  );
}

/**
 * Convenience: single "OK" information dialog.
 *
 * @example
 * Dialog.info("Profile saved!", "Your changes have been saved.");
 */
function info(
  title: string,
  message?: string,
  onDismiss?: () => void,
  options?: AlertOptions
): void {
  alert(
    title,
    message,
    [{ text: "OK", style: "default", onPress: onDismiss, isPreferred: true }],
    { icon: "info", ...options }
  );
}

/**
 * Convenience: error dialog.
 *
 * @example
 * Dialog.error("Upload failed", error.message);
 */
function error(
  title: string,
  message?: string,
  onDismiss?: () => void,
  options?: AlertOptions
): void {
  alert(
    title,
    message,
    [{ text: "OK", style: "default", onPress: onDismiss, isPreferred: true }],
    { icon: "error", ...options }
  );
}

/**
 * Convenience: success dialog.
 */
function success(
  title: string,
  message?: string,
  onDismiss?: () => void,
  options?: AlertOptions
): void {
  alert(
    title,
    message,
    [{ text: "OK", style: "default", onPress: onDismiss, isPreferred: true }],
    { icon: "success", ...options }
  );
}

/**
 * Convenience: warning dialog.
 */
function warning(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
): void {
  alert(title, message, buttons, { icon: "warning", ...options });
}

// ─── Exported service object ──────────────────────────────────────────────────

export const Dialog = {
  // Core (same as RN Alert)
  alert,

  // Convenience helpers
  confirm,
  info,
  error,
  success,
  warning,

  // Internal — used only by DialogProvider
  _subscribe:          subscribe,
  _setDismissCallback: setDismissCallback,
  _dismiss:            dismiss,
} as const;