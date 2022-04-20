import { Button, Typography } from '@mui/material';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'store/rootReducer';
import { incrementCounter } from 'store/slices/counterSlice';

const Home = () => {
  const count = useSelector((state: State) => state.counterState.count);
  const dispatch = useDispatch();

  const handleIncrementClick = (event: React.ChangeEvent<unknown>) => {
    dispatch(incrementCounter());
  };

  return (
    <>
      <Typography variant="h4">Example of React Component</Typography>
      <Typography gutterBottom>Redux Counter: {count}</Typography>
      <Button color="primary" onClick={handleIncrementClick} variant="contained">
        Increment
      </Button>
    </>
  );
};

export default Home;
