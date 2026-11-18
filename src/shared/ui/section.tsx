import MidDotText from './mid-dot-text'

const Section = ({ title, items }: { title: string; items: string[] }) => {
  if (!items.length) return null
  return (
    <section className="section">
      <h2 className="h3">{title}</h2>
      <ul className="b2 t2">
        {items.map((item) => (
          <li key={item}>
            <MidDotText text={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Section
