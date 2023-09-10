export const Failure = ({ message }: { message: string } = { message: 'Something went wrong.' }) => {
  return <span>Error: {message}</span>;
};
