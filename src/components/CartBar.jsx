import { ShoppingBag } from 'lucide-react'
import { brl } from '../data/menu.js'

export default function CartBar({ itens, subtotal, onOpen }) {
  return (
    <div className="cartbar">
      <button onClick={onOpen}>
        <span className="cartbar-icon">
          <ShoppingBag size={20} />
          <span className="cartbar-count">{itens}</span>
        </span>
        <span className="cartbar-label">Ver sacola</span>
        <strong>{brl(subtotal)}</strong>
      </button>
    </div>
  )
}
