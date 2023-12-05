export type GlobalState = AnyLiteral;
export type ActionNames = string;
export type ActionPayload = any;

export interface ActionOptions {
	silent?: boolean;
}
export type Actions = Record<ActionNames, (payload?: ActionPayload, options?: ActionOptions) => void>;

export type ActionHandler = (
  global: GlobalState,
  actions: Actions,
  payload: ActionPayload,
) => GlobalState | void | Promise<void>;

export type MapStateToProps<OwnProps = AnyLiteral> = (global: GlobalState, ownProps?: OwnProps) => Partial<GlobalState>;

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