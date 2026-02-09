'use client';

import { useEffect, type ReactNode } from 'react';

/**
 * Patches DOM methods (removeChild, insertBefore) to silently handle errors
 * caused by browser extensions (translators, Grammarly, etc.) modifying the DOM.
 *
 * These extensions wrap text nodes in <font>/<span> tags, which breaks React's
 * reconciliation when it tries to remove/insert nodes that have been moved.
 *
 * Instead of using a React Error Boundary (which triggers a re-render and destroys
 * component state like form wizard steps), this patches the DOM methods directly
 * so the errors never reach React.
 */
function patchDomMethods() {
  if (typeof window === 'undefined') return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // The child was moved by a browser extension — try removing from its actual parent
      if (child.parentNode) {
        return originalRemoveChild.call(child.parentNode, child) as T;
      }
      // Node is already detached, return it silently
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // Reference node was moved by a browser extension — just append instead
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export function DomErrorBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    patchDomMethods();
  }, []);

  return <>{children}</>;
}
