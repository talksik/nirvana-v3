interface Props {
  name: string;
}

export const HelloWorld = ({ name }: Props) => {
  return <div>Hello {name}</div>;
};
