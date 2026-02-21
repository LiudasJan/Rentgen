interface Props {
  text: string;
  term: string;
}

export default function SearchHighlight({ text, term }: Props) {
  if (!term.trim()) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase().trim();
  const index = lowerText.indexOf(lowerTerm);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + lowerTerm.length);
  const after = text.slice(index + lowerTerm.length);

  return (
    <>
      {before}
      <mark className="bg-yellow-200/50 dark:bg-yellow-500/30 rounded-sm text-inherit">{match}</mark>
      {after}
    </>
  );
}
