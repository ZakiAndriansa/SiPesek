export function Icon({
  name,
  className = "icon",
  ...rest
}: { name: string; className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} aria-hidden="true" {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
