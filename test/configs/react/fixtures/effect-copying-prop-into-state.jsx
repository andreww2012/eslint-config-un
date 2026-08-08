import {useEffect, useState} from 'react';

export const Widget = ({title}) => {
  const [derivedTitle, setDerivedTitle] = useState('');

  useEffect(() => {
    setDerivedTitle(title.toUpperCase());
  }, [title]);

  return <p>{derivedTitle}</p>;
};
