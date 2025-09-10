import React from "react";

export interface ActionOptions {
  silent?: boolean;
  forceSync?: boolean;
  reason?: string;
  shouldThrow?: boolean;
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

export type CachingOptions = {
  shouldRunFirstUpdateCacheThrottle: boolean;
  updateCacheThrottle: number;
  skipValidateKeySetOnReadCache: boolean;
};

export type PickOptions = {
  debugPicker?: boolean;
  debugPicked?: boolean;
  label?: string;
};

export interface TypedUseSelectorHook<TState> {
  <Selected>(
    selector: (state: TState) => Selected,
    inputs?: React.DependencyList,
    options?: PickOptions
  ): Selected;
}

export interface TypedUseStaticHook<TState> {
  <Selected>(
    selector: (state: TState) => Selected,
    inputs?: React.DependencyList
  ): Selected;
}

export type ConnectOptions = {
  nonMemoizedContainer?: boolean;
  label?: string;
  debugCallbackPicker?: boolean;
  debugCallbackPicked?: boolean;
  debugInitialPicker?: boolean;
};

export type TypedConnector<EState extends AnyLiteral> = <
  OwnProps = AnyLiteral,
  Selected = AnyLiteral,
  FState = EState,
>(
  mapStateToProps: (global: FState, ownProps: OwnProps) => Selected,
  options?: ConnectOptions,
) => (Component: React.FC<Selected & OwnProps>) => React.FC<OwnProps>;
