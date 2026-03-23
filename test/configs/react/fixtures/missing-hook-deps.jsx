import {useEffect} from 'react';

export const useMyEffect = (value) => {
  useEffect(() => {
    console.log(value);
  }, []);
};
