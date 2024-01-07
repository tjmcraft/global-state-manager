import React from "react";

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
  <Selected = AnyLiteral | undefined>(
    selector: (state: TState) => Selected,
    inputs?: React.DependencyList
  ): Selected | undefined;
}

export type TypedConnector<EState extends AnyLiteral> = <
  OwnProps = AnyLiteral,
  FState = EState,
  Selected = AnyLiteral & OwnProps
>(
  mapStateToProps: (global: FState, ownProps: OwnProps) => Selected
) => (Component: React.FC<Selected>) => React.FC<OwnProps>;
