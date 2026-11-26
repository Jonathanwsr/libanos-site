import { brl } from '../data/menu.js'

export default function CartBar({ itens, subtotal, onOpen }) {
  return (
    <div className="cartbar">
      <button onClick={onOpen}>
        <span className="cartbar-count">{itens}</span>
        <span>Ver sacola</span>
        <strong>{brl(subtotal)}</strong>
      </button>
    </div>
  )
}
