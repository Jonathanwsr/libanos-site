// Cardápio ilustrativo do protótipo. Nomes e preços são exemplos e podem ser
// trocados pelos dados reais da loja sem mexer no restante do código.

export const CATEGORIAS = [
  { id: 'esfihas-salgadas', nome: 'Esfihas salgadas', icone: '🥟' },
  { id: 'esfihas-doces', nome: 'Esfihas doces', icone: '🍫' },
  { id: 'kibes', nome: 'Kibes', icone: '🧆' },
  { id: 'beirutes', nome: 'Beirutes', icone: '🥙' },
  { id: 'combos', nome: 'Combos', icone: '🎁' },
  { id: 'bebidas', nome: 'Bebidas', icone: '🥤' },
]

export const PRODUTOS = [
  // Esfihas salgadas
  { id: 'es-carne', categoria: 'esfihas-salgadas', nome: 'Esfiha de carne', descricao: 'Carne moída temperada com tomate, cebola e limão.', preco: 4.5, emoji: '🥟', destaque: true },
  { id: 'es-frango', categoria: 'esfihas-salgadas', nome: 'Esfiha de frango', descricao: 'Frango desfiado temperado.', preco: 4.5, emoji: '🥟' },
  { id: 'es-frango-catupiry', categoria: 'esfihas-salgadas', nome: 'Esfiha de frango com catupiry', descricao: 'Frango desfiado com catupiry cremoso.', preco: 5.5, emoji: '🥟', destaque: true },
  { id: 'es-queijo', categoria: 'esfihas-salgadas', nome: 'Esfiha de queijo', descricao: 'Mussarela derretida.', preco: 4.5, emoji: '🧀' },
  { id: 'es-calabresa', categoria: 'esfihas-salgadas', nome: 'Esfiha de calabresa', descricao: 'Calabresa fatiada com cebola e mussarela.', preco: 5.0, emoji: '🥟' },
  { id: 'es-carne-sol', categoria: 'esfihas-salgadas', nome: 'Esfiha de carne de sol', descricao: 'Carne de sol desfiada com queijo coalho.', preco: 6.0, emoji: '🥟' },
  { id: 'es-pizza', categoria: 'esfihas-salgadas', nome: 'Esfiha de pizza', descricao: 'Presunto, mussarela, tomate e orégano.', preco: 5.0, emoji: '🍕' },
  // Esfihas doces
  { id: 'ed-chocolate', categoria: 'esfihas-doces', nome: 'Esfiha de chocolate', descricao: 'Chocolate ao leite cremoso.', preco: 5.5, emoji: '🍫' },
  { id: 'ed-romeu', categoria: 'esfihas-doces', nome: 'Esfiha romeu e julieta', descricao: 'Goiabada com queijo.', preco: 5.5, emoji: '🧀' },
  { id: 'ed-banana', categoria: 'esfihas-doces', nome: 'Esfiha de banana com canela', descricao: 'Banana, açúcar e canela.', preco: 5.0, emoji: '🍌' },
  // Kibes
  { id: 'kb-frito', categoria: 'kibes', nome: 'Kibe frito', descricao: 'Tradicional, crocante por fora.', preco: 5.0, emoji: '🧆' },
  { id: 'kb-queijo', categoria: 'kibes', nome: 'Kibe recheado com queijo', descricao: 'Kibe frito recheado com mussarela.', preco: 6.0, emoji: '🧆' },
  // Beirutes
  { id: 'bt-carne', categoria: 'beirutes', nome: 'Beirute de carne', descricao: 'Pão sírio, filé, queijo, alface e tomate.', preco: 28.0, emoji: '🥙' },
  { id: 'bt-frango', categoria: 'beirutes', nome: 'Beirute de frango', descricao: 'Pão sírio, frango, queijo, alface e tomate.', preco: 25.0, emoji: '🥙' },
  // Combos
  { id: 'cb-10', categoria: 'combos', nome: 'Combo 10 esfihas', descricao: '10 esfihas salgadas sortidas (sabores tradicionais).', preco: 40.0, emoji: '🎁', destaque: true },
  { id: 'cb-20', categoria: 'combos', nome: 'Combo família 20 esfihas + refri 2L', descricao: '20 esfihas sortidas e 1 refrigerante de 2 litros.', preco: 85.0, emoji: '🎁' },
  // Bebidas
  { id: 'bb-lata', categoria: 'bebidas', nome: 'Refrigerante lata 350ml', descricao: 'Coca-Cola, Guaraná ou Fanta.', preco: 6.0, emoji: '🥤' },
  { id: 'bb-2l', categoria: 'bebidas', nome: 'Refrigerante 2L', descricao: 'Coca-Cola ou Guaraná.', preco: 14.0, emoji: '🥤' },
  { id: 'bb-suco', categoria: 'bebidas', nome: 'Suco natural 500ml', descricao: 'Laranja, maracujá ou acerola.', preco: 8.0, emoji: '🧃' },
  { id: 'bb-agua', categoria: 'bebidas', nome: 'Água mineral 500ml', descricao: 'Com ou sem gás.', preco: 3.5, emoji: '💧' },
]

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
  // Coloque aqui o número real do WhatsApp da loja (DDI+DDD+número, só dígitos)
  // para ativar o botão "Falar com um atendente". Vazio = modo demonstração.
  whatsapp: '',
}

export const brl = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
