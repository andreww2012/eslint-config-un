let count = $state(0);

$inspect(count);

export const increment = () => {
  count += 1;
};
