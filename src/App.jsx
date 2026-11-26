import { useEffect, useMemo, useState, useCallback } from 'react'
import { BAIRROS, LOJA } from './data/menu.js'
import { load, save } from './storage.js'
import { useCatalogo } from './catalogo.jsx'
import Nav from './components/Nav.jsx'
import Menu from './components/Menu.jsx'
import CartBar from './components/CartBar.jsx'
import Checkout from './components/Checkout.jsx'
import OrderStatus from './components/OrderStatus.jsx'
import WhatsAppDemo from './components/WhatsAppDemo.jsx'
import Canais from './components/Canais.jsx'
import Conta from './components/Conta.jsx'
import Pedidos from './components/Pedidos.jsx'
import Promocoes from './components/Promocoes.jsx'
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

const soDigitos = (t) => (t || '').replace(/\D/g, '')

export default function App() {
  const [route, go] = useHashRoute()
  const { produtos } = useCatalogo()
  const [cart, setCart] = useState(() => load('libanos:cart', []))
  const [pedidos, setPedidos] = useState(() => load('libanos:orders', []))
  const [currentOrder, setCurrentOrder] = useState(() => load('libanos:currentOrder', null))
  const [conta, setConta] = useState(() => load('libanos:customer', null))
  const [contas, setContas] = useState(() => load('libanos:accounts', []))
  const [bairro, setBairro] = useState(() => load('libanos:bairro', ''))
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => save('libanos:cart', cart), [cart])
  useEffect(() => save('libanos:orders', pedidos), [pedidos])
  useEffect(() => save('libanos:currentOrder', currentOrder), [currentOrder])
  useEffect(() => save('libanos:customer', conta), [conta])
  useEffect(() => save('libanos:accounts', contas), [contas])
  useEffect(() => save('libanos:bairro', bairro), [bairro])

  const lastOrder = pedidos[0] || null

  const showToast = useCallback((msg, action) => {
    setToast({ msg, action, id: Date.now() })
  }, [])

  const acharProduto = useCallback((id) => produtos.find((p) => p.id === id), [produtos])

  const cartDetailed = useMemo(
    () => cart.map((l) => ({ ...l, produto: acharProduto(l.id) })).filter((l) => l.produto),
    [cart, acharProduto]
  )
  const subtotal = cartDetailed.reduce((s, l) => s + l.produto.preco * l.qtd, 0)
  const totalItens = cartDetailed.reduce((s, l) => s + l.qtd, 0)

  // ---- Conta (cadastro opcional, salvo só neste aparelho) ----
  const salvarConta = (c) => {
    if (!c) return
    setConta(c)
    setContas((lista) => [c, ...lista.filter((x) => soDigitos(x.telefone) !== soDigitos(c.telefone))])
  }
  const sair = () => {
    setConta(null)
    showToast('Você saiu da conta')
  }
  const apagarConta = () => {
    if (!conta) return
    setContas((lista) => lista.filter((x) => soDigitos(x.telefone) !== soDigitos(conta.telefone)))
    setConta(null)
    showToast('Seus dados foram apagados deste aparelho')
  }

  // ---- Sacola (H1 visibilidade, H3 controle/desfazer) ----
  const addItem = (id, qtd = 1, obs = '') => {
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && (l.obs || '') === obs)
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qtd: l.qtd + qtd } : l))
      return [...c, { id, qtd, obs, key: id + ':' + Date.now() }]
    })
    showToast(`${qtd}× ${acharProduto(id)?.nome ?? 'Item'} adicionado à sacola`)
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
    showToast(`${acharProduto(linha?.id)?.nome ?? 'Item'} removido`, { label: 'Desfazer', fn: () => setCart(anterior) })
  }

  const clearCart = () => {
    const anterior = cart
    setCart([])
    showToast('Sacola esvaziada', { label: 'Desfazer', fn: () => setCart(anterior) })
  }

  // ---- "Repetir pedido" (H7 flexibilidade) ----
  const repetir = (pedido) => {
    if (!pedido) return
    const linhas = pedido.itens
      .filter((l) => acharProduto(l.id))
      .map((l) => ({ ...l, key: l.id + ':' + Math.random().toString(36).slice(2) }))
    setCart(linhas)
    showToast('Itens do pedido estão na sacola')
    go('checkout')
  }

  const placeOrder = (dados) => {
    const taxaBairro = BAIRROS.find((b) => b.nome === dados.endereco?.bairro)?.taxa ?? 0
    const taxa = dados.tipo === 'entrega' && subtotal < LOJA.entregaGratisAcima ? taxaBairro : 0
    const pedido = {
      numero: Math.floor(1000 + Math.random() * 9000),
      criadoEm: Date.now(),
      itens: cartDetailed.map(({ id, qtd, obs }) => ({ id, qtd, obs })),
      subtotal,
      taxa,
      total: subtotal + taxa,
      ...dados,
    }
    setPedidos((p) => [pedido, ...p].slice(0, 20))
    setCurrentOrder(pedido)
    setCart([])
    go('pedido')
  }

  const isHome = route === '' || route === 'menu'
  let page
  if (route === 'checkout')
    page = (
      <Checkout cart={cartDetailed} subtotal={subtotal} changeQty={changeQty} removeLine={removeLine} clearCart={clearCart}
        savedCustomer={conta} onPlace={placeOrder} go={go} bairroInicial={bairro} />
    )
  else if (route === 'pedido')
    page = <OrderStatus pedido={currentOrder} savedCustomer={conta} onSaveCustomer={(c) => (c ? salvarConta(c) : apagarConta())} go={go} />
  else if (route === 'whatsapp') page = <WhatsAppDemo go={go} />
  else if (route === 'canais') page = <Canais go={go} />
  else if (route === 'promocoes') page = <Promocoes onAdd={addItem} go={go} />
  else if (route === 'pedidos') page = <Pedidos pedidos={pedidos} currentOrder={currentOrder} onRepetir={repetir} go={go} />
  else if (route === 'conta')
    page = (
      <Conta key={conta?.telefone || 'anon'} conta={conta} contas={contas} onSalvar={salvarConta}
        onEntrar={setConta} onSair={sair} onApagar={apagarConta} go={go} showToast={showToast} />
    )
  else
    page = (
      <Menu onAdd={addItem} lastOrder={lastOrder} onRepeat={() => repetir(lastOrder)} currentOrder={currentOrder} go={go}
        cart={cartDetailed} subtotal={subtotal} changeQty={changeQty} bairro={bairro} setBairro={setBairro} />
    )

  const showCartBar = (isHome || route === 'promocoes') && totalItens > 0

  return (
    <div className={'app' + (isHome ? ' is-home' : '')}>
      <div className="proto-banner" role="note">
        Protótipo acadêmico · TCC Sistemas de Informação UNIFACOL · nenhum pedido é enviado à loja
      </div>
      <Nav route={route} go={go} conta={conta} />
      <main className={showCartBar ? 'with-cartbar' : ''}>{page}</main>
      {showCartBar && <CartBar itens={totalItens} subtotal={subtotal} onOpen={() => go('checkout')} />}
      {route !== 'whatsapp' && <HelpButton go={go} lifted={showCartBar} />}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
