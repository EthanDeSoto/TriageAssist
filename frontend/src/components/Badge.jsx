import "./Badge.css";

export default function Badge({ tone, children, title }) {
  return (
    <span className={`badge badge-${tone}`} title={title}>
      {children}
    </span>
  );
}
