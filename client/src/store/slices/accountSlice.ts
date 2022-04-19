import { createSlice } from '@reduxjs/toolkit';

export const initialAccountState: AccountState = {
  created: false,
  isSecure: false,
};

export type AccountState = {
  created: boolean;
  isSecure: boolean;
};

const accountSlice = createSlice({
  name: 'account',
  initialState: initialAccountState,
  reducers: {
    setCreated: (state: AccountState) => {
      state.created = true;
    },
    setIsSecure: (state: AccountState) => {
      state.isSecure = true;
    },
  },
});

const { actions, reducer } = accountSlice;
export const { setCreated } = actions;
export const { setIsSecure } = actions;

export default reducer;
