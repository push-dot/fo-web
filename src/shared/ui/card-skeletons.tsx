import { LOADING_NAME } from './skeleton'

const CardSkeletons = ({ count }: { count: number }) => (
  <div className="job-grid sk-grid" aria-busy="true">
    <span className="sr-only">{LOADING_NAME}</span>
    {Array.from({ length: count }, (_, index) => (
      <span key={index} className="sk-card" aria-hidden="true">
        <span className="sk-ph" />
        <span className="sk-bar" style={{ width: '40%', height: 12 }} />
        <span className="sk-bar" style={{ width: '86%', height: 18 }} />
        <span className="sk-bar" style={{ width: '60%', height: 12 }} />
      </span>
    ))}
  </div>
)

export default CardSkeletons
