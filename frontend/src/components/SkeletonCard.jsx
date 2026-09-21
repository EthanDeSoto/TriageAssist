import "./ResultPanel.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-row">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-line" />
    </div>
  );
}
