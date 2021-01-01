import {directive, NodePart, Part, parts, TemplateInstance} from 'lit-html';
import {BehaviorSubject} from 'rxjs';
import {LitElement, PropertyValues} from 'lit-element';

export type DeactivateFn = () => any;
export type DirectiveFn = (part: Part) => DeactivateFn | undefined;
export type DirectiveFactory = (...args: any[]) => DirectiveFn;

const registeredDirectives = new WeakMap<Part, () => DirectiveFn>();
const activatedParts = new WeakMap<Part, DeactivateFn>();
const noop = () => undefined;

type Constructor = new (...args: any[]) => LitElement

type ReturnConstructor = new (...args: any[]) => LitElement;

/**
 * Directive with lifecycle hooks
 * ------------------------------
 * Inspired by work done by @Legioth
 * https://gist.github.com/Legioth/2594a6043f54e391615cefea73a5a079
 *
 * Must be used in conjunction with the LifecycleMixin
 */
export const lifecycleDirective = <F extends DirectiveFactory>(f: F): F =>
  directive((...args) => (part: Part) => {
    registeredDirectives.set(part, () => f(...args));
  }) as unknown as F;

function isTemplateInstance(value: any): value is TemplateInstance & {__parts: Array<Part | undefined>} {
  return value instanceof TemplateInstance;
}

function activatePart(part: NodePart): void {
  if (!activatedParts.has(part)) {
    const {value} = part;
    if (isTemplateInstance(value)) {
      (value as any).__parts.forEach((x: NodePart) => activatePart(x));
    } else if (Array.isArray(value)) {
      value.forEach((x: NodePart) => activatePart(x));
    }
    const registered = registeredDirectives.get(part);
    activatedParts.set(part, registered && registered()(part) || noop);
  }
}

function deactivatePart(part: NodePart): void {
  try {
    activatedParts.get(part)!();
  } catch (e) {
    console.error(`Error encountered whilst deactivating part`, e);
  } finally {
    activatedParts.delete(part);
  }
}

export function LifecycleMixin<B extends Constructor>(Base: B): B & ReturnConstructor {
  class Mixin extends Base {
    public isConnected$ = new BehaviorSubject<boolean>(true);

    connectedCallback() {
      super.connectedCallback();
      const part = parts.get(this.renderRoot);
      part && activatePart(part);
    }

    firstUpdated(_changedProperties: PropertyValues) {
      super.firstUpdated(_changedProperties);
      const part = parts.get(this.renderRoot);
      part && activatePart(part);
    }

    public getAllParts(root: NodePart): Array<NodePart> {
      if (isTemplateInstance(root.value)) {
        const parts: Array<NodePart> = (root.value as any).__parts;
        return parts.reduce(
          (acc, part) => ([...acc, ...this.getAllParts(part)]), [root]);
      }
      if (Array.isArray(root.value)) {
        return root.value.reduce(
          (acc, part) => ([...acc, ...this.getAllParts(part)]), [root]);
      }
      return [root];
    }

    async performUpdate(): Promise<unknown> {
      const rootPart = parts.get(this.renderRoot);
      const before = rootPart && this.getAllParts(rootPart) || [];
      const result = await super.performUpdate();
      const after = rootPart && this.getAllParts(rootPart) || [];
      before
        .filter(part => after.indexOf(part) === -1)
        .forEach(part => deactivatePart(part));
      after
        .filter(part => before.indexOf(part) === -1)
        .forEach(part => activatePart(part));
      return result;
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      const rootPart = parts.get(this.renderRoot);
      if (rootPart) {
        deactivatePart(rootPart);
      }
    }
  }

  return Mixin;
}
