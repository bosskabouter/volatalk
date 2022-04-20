import { combineReducers } from '@reduxjs/toolkit';
import accountSlice, { AccountState, initialAccountState } from './slices/accountSlice';
import counterSlice, { CounterState, initialCounterState } from './slices/counterSlice';
import eulaSlice, { EulaState, initialEulaState } from './slices/eulaSlice';

export type State = {
  counterState: CounterState;
  eulaState: EulaState;
  accountState: AccountState;
};

export const initialState: State = {
  counterState: initialCounterState,
  eulaState: initialEulaState,
  accountState: initialAccountState,
};

export const rootReducer = combineReducers({
  counterState: counterSlice,
  eulaState: eulaSlice,
  accountState: accountSlice,
});
