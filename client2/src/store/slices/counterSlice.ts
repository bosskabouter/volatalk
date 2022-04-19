import { createSlice } from '@reduxjs/toolkit';

export const initialCounterState: CounterState = {
  count: 0,
};

export type CounterState = {
  count: number;
};

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {
    incrementCounter: (state) => {
      state.count = ++state.count;
    },
  },
});

const { actions, reducer } = counterSlice;
export const { incrementCounter } = actions;

export default reducer;
