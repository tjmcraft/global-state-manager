export type GlobalState = AnyLiteral;


export interface ActionOptions {
	silent?: boolean;
}

export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
  keys?: Array<string>;
  getAllKeys(cb?: any): any;
}

export interface WebStorage extends Storage {
  /**
   * @desc Fetches key and returns item in a promise.
   */
  getItem(key: string): Promise<string | null>;
  /**
   * @desc Sets value for key and returns item in a promise.
   */
  setItem(key: string, item: string): Promise<void>;
  /**
   * @desc Removes value for key.
   */
  removeItem(key: string): Promise<void>;
}

interface Store<TState, ActionPayloads> {
	setState: (state?: Partial<TState>, options?: ActionOptions) => void;
	getState: <S = Partial<TState> | TState>(selector: (state: TState) => S) => S;
	addCallback: (cb: Function) => void;
	removeCallback: (cb: Function) => void;
	addReducer: (name: keyof ActionPayloads, reducer: AnyFunction) => void;
  removeReducer: (name: keyof ActionPayloads, reducer: AnyFunction) => void;
  getDispatch: () => unknown;
  withState: (selector: AnyFunction, debug?: AnyLiteral | undefined) => (callback: Function) => (() => void) | undefined;
}
