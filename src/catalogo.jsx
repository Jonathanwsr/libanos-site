import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Endpoint do cardápio. Para ligar a uma API real (ex.: a da plataforma da loja,
// com autorização), basta trocar esta URL — o formato esperado é o mesmo de
// public/api/cardapio.json: { categorias: [...], produtos: [...] }.
export const API_CARDAPIO = import.meta.env.VITE_API_CARDAPIO || '/api/cardapio.json'

const Ctx = createContext({ categorias: [], produtos: [], status: 'carregando' })

export function CatalogoProvider({ children }) {
  const [estado, setEstado] = useState({ categorias: [], produtos: [], status: 'carregando' })

  const carregar = useCallback(async () => {
    setEstado((e) => ({ ...e, status: 'carregando' }))
    try {
      const r = await fetch(API_CARDAPIO, { cache: 'no-cache' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const j = await r.json()
      setEstado({ categorias: j.categorias, produtos: j.produtos, status: 'ok' })
    } catch {
      setEstado((e) => ({ ...e, status: 'erro' }))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return <Ctx.Provider value={{ ...estado, recarregar: carregar }}>{children}</Ctx.Provider>
}

export const useCatalogo = () => useContext(Ctx)
