export function Boot({ label = "Le Livre Magique" }: { label?: string }) {
  return <div className="boot" role="status" aria-label={label} />;
}
