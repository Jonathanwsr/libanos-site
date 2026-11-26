// Dados fixos da loja. O cardápio (produtos, preços e imagens) vem da API: /api/cardapio.json

// Bairros atendidos e taxa de entrega (valores ilustrativos).
// Permite informar o endereço sem saber o CEP.
export const BAIRROS = [
  { nome: 'Centro', taxa: 4 },
  { nome: 'Matriz', taxa: 4 },
  { nome: 'Livramento', taxa: 5 },
  { nome: 'Cajá', taxa: 5 },
  { nome: 'Bela Vista', taxa: 6 },
  { nome: 'Lídia Queiroz', taxa: 6 },
  { nome: 'Maués', taxa: 6 },
  { nome: 'Mangueira', taxa: 6 },
  { nome: 'Redenção', taxa: 6 },
  { nome: 'Água Branca', taxa: 7 },
  { nome: 'Bairro Novo', taxa: 7 },
  { nome: 'Cidade de Deus', taxa: 7 },
  { nome: 'Jardim Ipiranga', taxa: 7 },
  { nome: 'Lagoa Redonda', taxa: 8 },
  { nome: 'Oiteiro', taxa: 8 },
  { nome: 'Outro bairro', taxa: 9 },
]

export const LOJA = {
  nome: 'Libanos Esfiharia',
  unidade: 'Av. 17 de Janeiro · Vitória de Santo Antão-PE',
  horario: 'Hoje: 17h às 23h',
  tempoEntrega: '40–60 min',
  pedidoMinimo: 15,
  entregaGratisAcima: 69,
  // Coloque aqui o número real do WhatsApp da loja (DDI+DDD+número, só dígitos)
  // para ativar o botão "Falar com um atendente". Vazio = modo demonstração.
  whatsapp: '',
}

export const brl = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
