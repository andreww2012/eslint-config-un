export const Dangerous = () => (
  // eslint-disable-next-line react/no-danger
  <div dangerouslySetInnerHTML={{__html: '<b>Hello</b>'}} />
);
