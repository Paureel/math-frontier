import {useLayoutEffect, useRef} from 'react';
import type {MouseEvent, PointerEvent, RefObject, SyntheticEvent} from 'react';

export function motionBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export function revealHeading(element: Element | null) {
  if (!element || element.closest('[hidden]')) return;
  const {top} = element.getBoundingClientRect();
  if (top < 16 || top > window.innerHeight - 160) {
    window.scrollBy({top: top - 24, behavior: motionBehavior()});
  }
}

export function useModalDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean, dismiss: () => void) {
  const backdropPress = useRef(false);
  const opener = useRef<HTMLElement | SVGElement | null>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | SVGElement | null;
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[autofocus]')?.focus({preventScroll: true});
    } else if (!open && dialog?.open) {
      dialog.close();
      if (opener.current?.isConnected && !document.querySelector('dialog[open]')) opener.current.focus({preventScroll: true});
    }
  }, [open, ref]);
  const outside = (event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLDialogElement>) => {backdropPress.current = outside(event);},
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      if (backdropPress.current && outside(event)) dismiss();
      backdropPress.current = false;
    },
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {event.preventDefault(); dismiss();},
    onClose: () => {
      // A queued close event must not dismiss a dialog that was just reopened.
      if (ref.current?.open) return;
      if (opener.current?.isConnected && !document.querySelector('dialog[open]')) opener.current.focus({preventScroll: true});
      if (open) dismiss();
    },
  };
}
