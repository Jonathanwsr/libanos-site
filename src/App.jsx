import { useEffect, useMemo, useState, useCallback } from 'react'
import { PRODUTOS, BAIRROS } from './data/menu.js'
import { load, save } from './storage.js'
import Header from './components/Header.jsx'
import Menu from './components/Menu.jsx'
import CartBar from './components/CartBar.jsx'
import Checkout from './components/Checkout.jsx'
import OrderStatus from './components/OrderStatus.jsx'
import WhatsAppDemo from './components/WhatsAppDemo.jsx'
import Canais from './components/Canais.jsx'
import HelpButton from './components/HelpButton.jsx'
import Toast from './components/Toast.jsx'

// Roteamento simples por hash (funciona em qualquer hospedagem estática).
function useHashRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, '') || ''
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => {
      setRoute(get())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((r) => {
    window.location.hash = '/' + r
  }, [])
  return [route, go]
}

export default function App() {
  const [route, go] = useHashRoute()
  const [cart, setCart] = useState(() => load('libanos:cart', []))
  const [lastOrder, setLastOrder] = useState(() => load('libanos:lastOrder', null))
  const [currentOrder, setCurrentOrder] = useState(() => load('libanos:currentOrder', null))
  const [savedCustomer, setSavedCustomer] = useState(() => load('libanos:customer', null))
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => save('libanos:cart', cart), [cart])
  useEffect(() => save('libanos:lastOrder', lastOrder), [lastOrder])
  useEffect(() => save('libanos:currentOrder', currentOrder), [currentOrder])
  useEffect(() => save('libanos:customer', savedCustomer), [savedCustomer])

  const showToast = useCallback((msg, action) => {
    setToast({ msg, action, id: Date.now() })
  }, [])

  const cartDetailed = useMemo(
    () =>
      cart
        .map((l) => ({ ...l, produto: PRODUTOS.find((p) => p.id === l.id) }))
        .filter((l) => l.produto),
    [cart]
  )
  const subtotal = cartDetailed.reduce((s, l) => s + l.produto.preco * l.qtd, 0)
  const totalItens = cart.reduce((s, l) => s + l.qtd, 0)

  // ---- Ações da sacola (H1 visibilidade, H3 controle/desfazer) ----
  const addItem = (id, qtd = 1, obs = '') => {
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && (l.obs || '') === obs)
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qtd: l.qtd + qtd } : l))
      return [...c, { id, qtd, obs, key: id + ':' + Date.now() }]
    })
    const p = PRODUTOS.find((x) => x.id === id)
    showToast(`✓ ${qtd}× ${p.nome} adicionado à sacola`)
  }

  const changeQty = (key, delta) => {
    const linha = cart.find((l) => l.key === key)
    if (!linha) return
    if (linha.qtd + delta <= 0) return removeLine(key)
    setCart((c) => c.map((l) => (l.key === key ? { ...l, qtd: l.qtd + delta } : l)))
  }

  const removeLine = (key) => {
    const anterior = cart
    const linha = cart.find((l) => l.key === key)
    setCart((c) => c.filter((l) => l.key !== key))
    const p = PRODUTOS.find((x) => x.id === linha?.id)
    showToast(`${p?.nome ?? 'Item'} removido`, { label: 'Desfazer', fn: () => setCart(anterior) })
  }

  const clearCart = () => {
    const anterior = cart
    setCart([])
    showToast('Sacola esvaziada', { label: 'Desfazer', fn: () => setCart(anterior) })
  }

  // ---- "Repetir último pedido" (H7 flexibilidade) ----
  const repeatLast = () => {
    if (!lastOrder) return
    const linhas = lastOrder.itens
      .filter((l) => PRODUTOS.some((p) => p.id === l.id))
      .map((l) => ({ ...l, key: l.id + ':' + Math.random().toString(36).slice(2) }))
    setCart(linhas)
    showToast('Itens do seu último pedido estão na sacola')
    go('checkout')
  }

  const placeOrder = (dados) => {
    const bairro = BAIRROS.find((b) => b.nome === dados.endereco?.bairro)
    const taxa = dados.tipo === 'entrega' ? bairro?.taxa ?? 0 : 0
    const pedido = {
      numero: Math.floor(1000 + Math.random() * 9000),
      criadoEm: Date.now(),
      itens: cart.map(({ id, qtd, obs }) => ({ id, qtd, obs })),
      subtotal,
      taxa,
      total: subtotal + taxa,
      ...dados,
    }
    setLastOrder(pedido)
    setCurrentOrder(pedido)
    setCart([])
    go('pedido')
  }

  let page
  if (route === 'checkout')
    page = (
      <Checkout
        cart={cartDetailed}
        subtotal={subtotal}
        changeQty={changeQty}
        removeLine={removeLine}
        clearCart={clearCart}
        savedCustomer={savedCustomer}
        onPlace={placeOrder}
        go={go}
      />
    )
  else if (route === 'pedido')
    page = (
      <OrderStatus
        pedido={currentOrder}
        savedCustomer={savedCustomer}
        onSaveCustomer={setSavedCustomer}
        go={go}
      />
    )
  else if (route === 'whatsapp') page = <WhatsAppDemo go={go} />
  else if (route === 'canais') page = <Canais go={go} />
  else
    page = (
      <Menu
        onAdd={addItem}
        lastOrder={lastOrder}
        onRepeat={repeatLast}
        currentOrder={currentOrder}
        go={go}
      />
    )

  const showCartBar = (route === '' || route === 'menu') && totalItens > 0

  return (
    <div className="app">
      <div className="proto-banner" role="note">
        Protótipo acadêmico (TCC · Sistemas de Informação · UNIFACOL). Nenhum pedido é enviado à loja.
      </div>
      <Header go={go} route={route} />
      <main className={showCartBar ? 'with-cartbar' : ''}>{page}</main>
      {showCartBar && (
        <CartBar itens={totalItens} subtotal={subtotal} onOpen={() => go('checkout')} />
      )}
      {route !== 'whatsapp' && <HelpButton go={go} lifted={showCartBar} />}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
