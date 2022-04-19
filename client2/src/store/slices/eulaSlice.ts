import { createSlice } from '@reduxjs/toolkit';

export const initialEulaState: EulaState = {
  accepted: false,
};

export type EulaState = {
  accepted: boolean;
};

const eulaSlice = createSlice({
  name: 'eula',
  initialState: initialEulaState,
  reducers: {
    acceptEula: (state: EulaState) => {
      state.accepted = true;
    },
  },
});

const { actions, reducer } = eulaSlice;
export const { acceptEula } = actions;

export default reducer;
