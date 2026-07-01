/**
 * Toast service — placeholder implementation.
 *
 * Every caller in this app talks to this module, never to a toast
 * library directly. When you wire in a real one (sonner, react-hot-toast,
 * etc.), only this file changes.
 */

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  description?: string;
}

function show(variant: ToastVariant, options: ToastOptions): void {
  // TODO: replace with a real toast implementation.
  console.log(`[toast:${variant}]`, options.title ?? '', options.description ?? '');
}

function success(options: ToastOptions): void {
  show('success', options);
}

function error(options: ToastOptions): void {
  show('error', options);
}

function info(options: ToastOptions): void {
  show('info', options);
}

function warning(options: ToastOptions): void {
  show('warning', options);
}

export const toastService = {
  success,
  error,
  info,
  warning,
};

export default toastService;