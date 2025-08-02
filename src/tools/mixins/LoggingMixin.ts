type Constructor<T = {}> = abstract new (...args: any[]) => T;

export function LoggingMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  abstract class LoggingClass extends Base {
    static debug = false;

    private get _debug() {
      return (this.constructor as typeof LoggingClass).debug;
    }

    log(...args: any[]) {
      if (this._debug) console.log('[LOG]', this, ...args);
    }

    warn(...args: any[]) {
      if (this._debug) console.warn('[WARN]', this, ...args);
    }

    error(...args: any[]) {
      if (this._debug) console.error('[ERROR]', this, ...args);
    }
  }

  return LoggingClass;
}
