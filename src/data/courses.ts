import { coursesPart2 } from './coursesPart2';
import { coursesPart3 } from './coursesPart3';
import { coursesPart4 } from './coursesPart4';
import { coursesPart5 } from './coursesPart5';
import { coursesPart6 } from './coursesPart6';
import { coursesPart7 } from './coursesPart7';

export type MediaType = 'video' | 'audio' | 'text' | 'quiz' | 'slide';

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: string;
  mediaType: MediaType;
  isSpecial?: boolean;
  slideBgUrl?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: 'Dublagem' | 'Fonoaudiologia' | 'Carreira';
  imageUrl: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os níveis';
  lessons: Lesson[];
};

export const originalCourses: Course[] = [
  {
    id: 'plano-de-carreira',
    title: 'Plano de Carreira Abrangente para Dubladores',
    description: 'O guia definitivo desde o desenvolvimento de habilidades essenciais até a negociação de cachês, marketing pessoal e o diretório completo de estúdios.',
    category: 'Carreira',
    imageUrl: 'https://images.unsplash.com/photo-1516280440502-65f536af1214?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Todos os níveis',
    lessons: [
      {
        id: 'c1-l1',
        title: '1. O Tripé do Dublador',
        duration: '10 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Tripé do Dublador\n\nPara entrar no mercado, você precisa dominar três pilares fundamentais:\n\n1. **Interpretação (Atuação):** A dublagem é, antes de tudo, atuação. Sem a base teatral, a técnica de sincronia é inútil. Estude teatro, improvisação e construção de personagens. A voz é apenas o veículo da emoção que o seu corpo inteiro produz.\n2. **Técnica Vocal e Fonoaudiologia:** Controle de respiração, dicção perfeita e resistência vocal. Você passará horas em uma cabine, muitas vezes gritando ou sussurrando. Sem técnica, você perde a voz no primeiro dia.\n3. **Sincronia (Lip Sync):** A habilidade técnica de encaixar sua interpretação no tempo da boca do personagem original. É a matemática da dublagem: a emoção certa, no tempo exato.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Avaliar a conexão entre sua expressão corporal e sua voz.\n\n1.  **Passo 1 (A Escolha):** Escolha um monólogo curto (1 minuto) de um filme ou peça de teatro que você goste.\n2.  **Passo 2 (A Gravação em Vídeo):** Posicione seu celular e grave-se atuando esse monólogo. Tente colocar o máximo de emoção possível.\n3.  **Passo 3 (A Análise Muda):** Assista ao vídeo que você gravou, mas **sem som**. Observe seu rosto, seus olhos e seus ombros. Eles estão transmitindo a emoção do texto? Ou você parece um "leitor de notícias"?\n4.  **Passo 4 (A Análise Sonora):** Agora assista com som. A voz que você ouve combina com a expressão corporal que você viu? Na dublagem, mesmo que o público não veja seu corpo, a energia física que você coloca na atuação é transmitida pela voz.'
      },
      {
        id: 'c1-l2',
        title: '2. Construção de um Portfólio (Voice Reel)',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1516280440502-65f536af1214?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Como montar um Voice Reel Matador\n\nO Voice Reel é o seu cartão de visitas. Diretores de dublagem não têm tempo para ouvir áudios de 5 minutos.\n\n*   **Duração ideal:** 1 a 2 minutos no máximo. O diretor decide se gosta da sua voz nos primeiros 10 segundos.\n*   **Estrutura:** Comece com sua voz natural (a que você mais usará no dia a dia). Depois, adicione 3 a 4 trechos curtos (15s cada) mostrando versatilidade (drama intenso, comédia leve, vilão caricato, narração documental).\n*   **Qualidade Técnica:** O áudio deve ser impecável. Um demo com chiado ou eco de quarto será descartado imediatamente. Grave em estúdio profissional ou em um Home Studio com excelente tratamento acústico.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Estruturar o roteiro do seu futuro Voice Reel.\n\n1.  **Passo 1 (A Voz Natural):** Encontre um texto curto (15s) de um personagem que tenha a sua idade e uma personalidade parecida com a sua. Essa será a abertura do seu reel.\n2.  **Passo 2 (O Contraste):** Escolha um texto que exija uma emoção completamente oposta à do primeiro (ex: se o primeiro foi calmo, o segundo deve ser uma discussão acalorada).\n3.  **Passo 3 (A Caricatura):** Escolha um texto de desenho animado ou anime que permita exagerar na interpretação e brincar com os limites da sua voz.\n4.  **Passo 4 (A Gravação Teste):** Grave esses três trechos no seu celular. Ouça-os em sequência. Eles soam como três pessoas diferentes ou apenas você lendo três textos? O objetivo é mostrar alcance.'
      },
      {
        id: 'c1-l3',
        title: '3. Estratégias de Marketing Pessoal',
        duration: '10 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Como ser visto e lembrado\n\nNo mercado de dublagem, quem não é visto não é escalado. O talento é essencial, mas o marketing garante que as pessoas certas saibam que você existe.\n\n*   **Redes Sociais Estratégicas:** Use o Instagram e TikTok profissionalmente. Mostre bastidores (quando permitido por NDA), dicas de dublagem, trechos do seu portfólio e sua rotina de estudos. Seu perfil deve gritar "Sou um profissional da voz".\n*   **Networking Ativo:** Frequente workshops, painéis de cultura pop (CCXP, feiras de anime) e cursos ministrados por diretores em atividade. A dublagem é um mercado de relacionamento.\n*   **Reputação no Estúdio:** Seja o profissional que resolve problemas, não o que cria. Chegue 15 minutos antes, seja educado com os técnicos de som, receba direção sem ego e entregue o trabalho rápido. O boca a boca é o seu maior marketing.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Auditar e profissionalizar sua presença online.\n\n1.  **Passo 1 (A Bio):** Abra seu Instagram. Sua biografia diz claramente o que você faz? Altere para algo como: "Ator/Dublador | DRT: [Seu Número] | Contato: [Seu E-mail]".\n2.  **Passo 2 (O Link):** Adicione um link (Linktree ou similar) na sua bio que direcione diretamente para o seu Voice Reel no YouTube ou Google Drive.\n3.  **Passo 3 (A Limpeza):** Arquive fotos muito pessoais ou polêmicas que não agreguem à sua imagem profissional. Mantenha o foco na sua arte.\n4.  **Passo 4 (O LinkedIn):** Crie ou atualize seu perfil no LinkedIn. É lá que produtores de games e agências de publicidade internacionais procuram vozes.'
      },
      {
        id: 'c1-l4',
        title: '4. Negociação de Cachês e Direitos',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Entendendo a Remuneração\n\nA dublagem no Brasil é regulamentada e possui tabelas de valores mínimos estabelecidas pelos sindicatos (SATED). Nunca cobre menos que a tabela, isso desvaloriza você e toda a classe.\n\n*   **Como funciona o pagamento (Estúdios):** Geralmente é pago por "anel" (trechos de 20 segundos de filme) mais um valor fixo de "convocação" (a hora que você fica à disposição do estúdio).\n*   **Direitos Conexos:** São os valores que você recebe pela exibição pública da sua voz (TV aberta, TV fechada). É fundamental estar filiado a uma associação de gestão coletiva (como a INTERTIS ou Abramus) para receber esses valores.\n*   **Streaming, Games e Internet:** Possuem tabelas e acordos específicos. Muitas vezes o contrato é de *buyout* (compra total dos direitos por um período ou para sempre). Leia os contratos com extrema atenção antes de assinar.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Familiarizar-se com a tabela de valores do mercado.\n\n1.  **Passo 1 (A Busca):** Acesse o site do SATED do seu estado (ex: SATED-SP ou SATED-RJ).\n2.  **Passo 2 (A Tabela):** Procure pela "Tabela de Cachês" ou "Acordo Coletivo de Dublagem" mais recente.\n3.  **Passo 3 (A Análise):** Encontre os valores para: "Convocação (1 hora)" e "Valor por Anel".\n4.  **Passo 4 (O Cálculo):** Imagine que você foi escalado para dublar 15 anéis em uma sessão de 1 hora. Calcule qual seria o seu cachê bruto (Valor da Convocação + (15 x Valor do Anel)). Isso te dará uma noção real de quanto um dublador ganha por sessão.'
      },
      {
        id: 'c1-l5',
        title: '5. Diretório de Estúdios e Como se Cadastrar',
        duration: 'Leitura',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        isSpecial: true,
        content: '### Onde enviar seu material\n\n*Atenção: Só envie seu material se você possuir DRT de Ator e um Voice Reel de alta qualidade.*\n\n#### São Paulo (SP)\n\n*   **Unidub**\n    *   **Foco:** Games, Animes, Filmes.\n    *   **Como cadastrar:** Envie e-mail para `testes@unidub.com.br` com Voice Reel (MP3) e foto do DRT.\n*   **Vox Mundi**\n    *   **Foco:** Séries, Documentários, Filmes.\n    *   **Como cadastrar:** Preencha o formulário no site oficial na aba "Talentos".\n*   **Centauro**\n    *   **Foco:** Novelas, Animes, Séries.\n    *   **Como cadastrar:** Envie e-mail para `vozes@centauro.com.br` com o assunto "Cadastro Novo Dublador - [Seu Nome]".\n*   **TV Group Digital**\n    *   **Foco:** Disney, grandes produções.\n    *   **Como cadastrar:** Envie material para `casting@tvgroup.com.br`.\n\n#### Rio de Janeiro (RJ)\n\n*   **Delart**\n    *   **Foco:** Cinema, grandes blockbusters.\n    *   **Como cadastrar:** Envie material para `banco_vozes@delart.com.br` ou entregue presencialmente quando houver chamada.\n*   **Cinevídeo**\n    *   **Como cadastrar:** E-mail para `contato@cinevideo.com.br`.\n*   **Som de Vera Cruz**\n    *   **Como cadastrar:** E-mail para `casting@somdeveracruz.com.br`.\n\n#### Dicas de Ouro para o E-mail:\n1. Seja extremamente breve. (Ex: "Olá, sou ator/dublador com DRT, segue meu material para avaliação").\n2. Não mande arquivos pesados. Use links do Google Drive ou SoundCloud.\n3. Não cobre respostas. O mercado é dinâmico; se precisarem do seu perfil, eles entrarão em contato.'
      }
    ]
  },
  {
    id: 'fono-respiracao',
    title: 'Fonoaudiologia: Respiração e Apoio',
    description: 'Aprenda a base da fonoaudiologia para o uso profissional da voz. Controle o ar para não perder o fôlego em anéis longos.',
    category: 'Fonoaudiologia',
    imageUrl: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Iniciante',
    lessons: [
      {
        id: 'c2-l1',
        title: '1. Anatomia da Respiração Costo-Diafragmática',
        duration: '12 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### A Base da Projeção Vocal\n\nA respiração clavicular (aquela em que os ombros sobem e o peito estufa) gera tensão no pescoço e nas pregas vocais. É a respiração do susto. A respiração correta e segura para o dublador é a **Costo-Diafragmática**.\n\n**Como funciona a máquina:**\n- O diafragma (um músculo em forma de paraquedas abaixo dos pulmões) desce, empurrando os órgãos abdominais para baixo e para frente (a barriga "estufa").\n- As costelas inferiores se expandem lateralmente, abrindo espaço.\n- O ar entra profundamente nas bases dos pulmões, garantindo maior volume de ar e controle absoluto sobre a saída da voz.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Isolar e treinar a respiração costo-diafragmática.\n\n1.  **Passo 1 (A Postura):** Deite-se no chão de barriga para cima. Dobre os joelhos e apoie os pés no chão (isso relaxa a lombar).\n2.  **Passo 2 (O Peso):** Coloque um livro grosso ou um pacote de 1kg de arroz sobre o seu umbigo.\n3.  **Passo 3 (A Inspiração):** Inspire lentamente pelo nariz contando até 4. Concentre-se em fazer o livro **subir** em direção ao teto. Seus ombros e peito NÃO devem se mover.\n4.  **Passo 4 (A Pausa):** Segure o ar por 2 segundos, mantendo o livro no alto.\n5.  **Passo 5 (A Expiração):** Solte o ar lentamente pela boca fazendo um som de "S" contínuo (como um pneu vazando) contando até 8. O livro deve descer lentamente. Repita 5 vezes.'
      },
      {
        id: 'c2-l2',
        title: '2. Apoio e Pressão Subglótica',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O "Apoio" do Ator\n\nTer muito ar nos pulmões não é suficiente; você precisa controlar a *velocidade* em que esse ar sai. Isso é o "apoio diafragmático" (ou apoio respiratório).\n\n*   **O que é:** É a contração isométrica (firmeza sem movimento brusco) da musculatura abdominal e intercostal para "frear" a subida rápida do diafragma enquanto você fala.\n*   **Por que importa:** O apoio é o que permite que você fale frases longas sem perder a intensidade no final da frase. Mais importante ainda: é o apoio que permite gritar, chorar ou rir histericamente no estúdio sem machucar a garganta. A força do grito vem da barriga (pressão subglótica controlada), não do pescoço.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Sentir e ativar a musculatura de apoio.\n\n1.  **Passo 1 (A Posição):** Fique de pé. Coloque as mãos na cintura, com os polegares nas costas e os outros dedos apertando levemente a lateral da sua barriga (abaixo das costelas).\n2.  **Passo 2 (A Ativação):** Tussa levemente duas vezes. Sinta como a musculatura sob seus dedos "pula" para fora. Esse é o seu cinto de apoio.\n3.  **Passo 3 (A Sustentação):** Inspire profundamente (expandindo a barriga e as costelas). Agora, faça o som de "X" (Xiiiiii) de forma muito forte e contínua.\n4.  **Passo 4 (O Foco):** Enquanto faz o "X", mantenha a musculatura sob seus dedos firme e empurrando levemente para fora. Não deixe a barriga murchar rapidamente. O som deve ser constante, sem tremer. Segure por 10 segundos.'
      },
      {
        id: 'c2-l3',
        title: '3. Gerenciamento de Ar em Frases Longas',
        duration: '10 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Desafio do Anel Longo\n\nNa dublagem, um "anel" (trecho de gravação) pode ter até 20 segundos de fala ininterrupta do personagem. Se você não gerenciar seu ar, vai ficar ofegante no meio da frase ou a sua voz vai "morrer" no final.\n\n*   **Planejamento Visual:** Ao passar a cena, marque no seu script (mentalmente ou com um lápis) os pontos exatos onde o personagem original respira. Você deve respirar junto com ele.\n*   **Respiração de Resgate (Roubo de Ar):** Aprenda a "roubar" pequenas quantidades de ar rapidamente pela boca nos micro-espaços entre as vírgulas, sem fazer barulho excessivo de sucção. É uma respiração curta e silenciosa que mantém o tanque cheio.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Treinar a economia de ar e o "roubo" rápido.\n\n1.  **Passo 1 (O Texto):** Pegue um parágrafo longo de um livro ou notícia (cerca de 5 linhas).\n2.  **Passo 2 (O Desafio Extremo):** Inspire profundamente uma única vez. Leia o parágrafo inteiro em voz alta, em velocidade normal, tentando chegar o mais longe possível sem respirar novamente. Anote onde o ar acabou.\n3.  **Passo 3 (O Planejamento):** Agora, marque com uma barra (/) três pontos estratégicos no texto onde faria sentido fazer uma micro-pausa (ex: vírgulas ou fim de ideias).\n4.  **Passo 4 (A Execução com Roubo):** Leia o texto novamente. Toda vez que chegar na barra (/), faça um "roubo de ar" (uma inspiração curtíssima e silenciosa pela boca, expandindo a barriga). Chegue ao final do texto com sobra de ar e volume constante.'
      }
    ]
  },
  {
    id: 'fono-articulacao',
    title: 'Fonoaudiologia: Articulação e Dicção',
    description: 'Exercícios para evitar "comer" sílabas, garantir clareza e aprender a neutralizar sotaques para o mercado nacional.',
    category: 'Fonoaudiologia',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Intermediário',
    lessons: [
      {
        id: 'c3-l1',
        title: '1. Os Articuladores Ativos e Passivos',
        duration: '10 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Conhecendo sua Ferramenta\n\nA clareza da sua fala (dicção) depende de como você usa seus articuladores para esculpir o som que sai das cordas vocais.\n\n*   **Articuladores Ativos:** Língua, lábios, véu palatino (palato mole) e mandíbula. São as partes que se movem. Se eles forem "preguiçosos", sua fala sai embolada.\n*   **Articuladores Passivos:** Dentes e palato duro (céu da boca). Servem de ponto de contato ou "parede" para os articuladores ativos baterem e formarem as consoantes (ex: a língua bate nos dentes para fazer o "T").\n\nPara uma dicção perfeita, rápida e sem tropeços, os articuladores ativos precisam de tônus muscular (força de academia) e agilidade.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Aquecer e soltar a musculatura dos articuladores ativos.\n\n1.  **Passo 1 (A Mandíbula):** Massageie as articulações perto das orelhas. Abra a boca o máximo que puder (como um bocejo gigante) e feche lentamente. Repita 5 vezes.\n2.  **Passo 2 (Os Lábios):** Faça o som de um motor de barco ou cavalo relinchando (Brrrrr), fazendo os lábios vibrarem intensamente. Mantenha o som contínuo por 10 segundos. Repita 3 vezes.\n3.  **Passo 3 (A Língua):** Estale a língua no céu da boca (som de cavalo trotando). Comece devagar e vá aumentando a velocidade até o seu limite máximo. Faça por 30 segundos.\n4.  **Passo 4 (A Limpeza):** Diga a frase "O rato roeu a roupa do rei de Roma" antes e depois dos exercícios. Sinta como as palavras saem mais fáceis e "limpas" após o aquecimento.'
      },
      {
        id: 'c3-l2',
        title: '2. Sobrarticulação e Trava-línguas',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Treino de Peso da Voz\n\nA sobrarticulação é o ato de exagerar propositalmente os movimentos da boca, lábios e língua ao falar. É um exercício de "musculação" para a dicção, não a forma como você vai atuar no estúdio (onde a fala deve ser natural).\n\n**A Técnica da Rolha/Caneta:**\nEsta é a técnica mais famosa entre atores para "soltar" a dicção rapidamente antes de entrar em cena ou gravar.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Melhorar a precisão e a leveza da articulação das palavras.\n\n1.  **Passo 1 (O Obstáculo):** Pegue uma rolha de vinho de cortiça (lave-a bem) ou uma caneta limpa. Coloque-a horizontalmente entre os dentes da frente, mordendo levemente (não machuque a boca).\n2.  **Passo 2 (O Desafio):** Com o obstáculo na boca, leia o seguinte trava-língua em voz alta: *"O desinquietador desinquietou as desinquietações dos desinquietos."*\n3.  **Passo 3 (O Esforço):** Tente ser o mais compreensível possível. Você sentirá sua língua e seus lábios fazendo um esforço enorme para contornar o obstáculo e formar as palavras. Leia o trava-língua 3 vezes seguidas.\n4.  **Passo 4 (A Mágica):** Retire a rolha/caneta da boca. Imediatamente, leia o trava-língua novamente. Você sentirá sua boca incrivelmente leve, rápida e a dicção sairá perfeita e cristalina, como se tivesse tirado pesos dos tornozelos.'
      },
      {
        id: 'c3-l3',
        title: '3. Neutralização de Sotaque',
        duration: '20 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Sotaque "Neutro" Brasileiro\n\nNa dublagem (especialmente nos grandes polos de SP e RJ), exige-se um sotaque "neutro". O objetivo é que a obra seja aceita em todo o Brasil sem que o público identifique de qual estado o dublador é, mantendo a imersão na história.\n\n**Principais pontos de atenção (Marcadores Regionais):**\n*   **O "S" chiado (Carioca/Nordeste):** Em palavras como "mesmo" (mezmo) ou "festa" (fexta). O neutro exige o som de /s/ ou /z/ limpo, estilo paulista.\n*   **O "R" retroflexo (Caipira/Interior):** O "R" enrolado de "porta" ou "verde". O neutro usa o "R" brando (teco) ou o "R" gutural muito leve.\n*   **O "T" e "D" chiados (Nordeste/Norte):** Falar "Tchia" (Tia) ou "Djia" (Dia). O neutro usa o som dental puro (Tia, Dia).\n*   **Vogais Abertas/Fechadas:** Diferenças regionais no "E" e "O" (ex: "éxtra" vs "êxtra").\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Identificar e neutralizar seus próprios marcadores regionais.\n\n1.  **Passo 1 (O Texto Padrão):** Escreva a frase: "A tia foi à festa verde no dia seguinte, mesmo sabendo da porta fechada." (Esta frase contém todos os marcadores acima).\n2.  **Passo 2 (A Gravação Natural):** Grave-se lendo a frase com o seu sotaque natural do dia a dia.\n3.  **Passo 3 (A Escuta Crítica):** Ouça a gravação. Identifique quais letras você puxa mais (o S chia? o R enrola? o T é forte?).\n4.  **Passo 4 (A Neutralização):** Tente ler a frase novamente, focando em limpar as consoantes. Faça o "S" limpo (fesss-ta), o "R" leve (póh-ta ou por-ta paulistano), e o "T/D" batendo a língua nos dentes (Ti-a, Di-a). Grave e compare com a primeira versão.'
      }
    ]
  },
  {
    id: 'dublagem-sincronia',
    title: 'Dublagem Prática: Sincronia Labial',
    description: 'Domine a arte de encaixar as palavras na boca do personagem perfeitamente, respeitando as labiais e o tempo da cena.',
    category: 'Dublagem',
    imageUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Intermediário',
    lessons: [
      {
        id: 'c4-l1',
        title: '1. Mapeamento de Labiais (B, P, M)',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### A Matemática da Dublagem\n\nAs consoantes bilabiais (B, P, M) são os pontos de ancoragem da dublagem. São os momentos em que a boca do ator na tela fecha completamente.\n\nSe o personagem fecha a boca na tela (ex: falando "Baby" em inglês), você precisa ter uma labial (B, P, M) ou uma pausa no seu texto em português nesse exato momento (ex: "Bebê"). Se a boca dele fecha e você está falando um "A" bem aberto, a ilusão da dublagem se quebra e o público percebe o erro.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Treinar o olho para identificar o fechamento labial na tela.\n\n1.  **Passo 1 (A Preparação):** Abra um vídeo no YouTube de uma pessoa falando inglês de frente para a câmera (um vlog ou entrevista). Tire o som completamente (Mute).\n2.  **Passo 2 (A Observação Ativa):** Assista a 30 segundos do vídeo focando EXCLUSIVAMENTE na boca da pessoa.\n3.  **Passo 3 (O Clique):** Toda vez que você ver os lábios da pessoa se tocarem e fecharem completamente (formando um B, P ou M), estale os dedos ou bata na mesa.\n4.  **Passo 4 (O Treino do Cérebro):** Repita isso por 5 minutos. Você está treinando seu cérebro para reconhecer instantaneamente a "batida" visual que exigirá uma labial no seu roteiro de dublagem.'
      },
      {
        id: 'c4-l2',
        title: '2. O "Bater" da Boca e Pausas Dramáticas',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1516280440502-65f536af1214?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: `### Tempo e Ritmo\n\nSincronia não é apenas começar a falar junto e terminar junto. É respeitar o ritmo interno da frase e o movimento da mandíbula do ator original.\n\n*   **Pausas (Respiros):** Se o ator original respira, hesita ou faz uma pausa dramática no meio da frase, você DEVE fazer o mesmo. A pausa faz parte da atuação.\n*   **O "Bater" da boca:** É o movimento rítmico da mandíbula (abrir e fechar). Se o ator fala rápido e muito articulado, sua fala em português deve ter a mesma energia rítmica (muitas sílabas), mesmo que as palavras sejam diferentes. Se ele fala de forma arrastada, você deve arrastar as vogais em português.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Copiar o ritmo e a métrica de uma fala estrangeira sem usar palavras.\n\n1.  **Passo 1 (O Áudio Original):** Escolha uma cena de filme em inglês (ou outro idioma) com uma frase de uns 5 segundos. Ouça a frase 3 vezes prestando atenção apenas na "música" da fala (o ritmo, as pausas, onde sobe, onde desce).\n2.  **Passo 2 (A Desconstrução):** Esqueça as palavras em inglês. Tente imitar o ritmo exato da fala usando apenas a sílaba "Lá". (Ex: Se ele diz "I don\\'t know... what to do", você dirá "Lá lá lá... lá lá lá").\n3.  **Passo 3 (A Sincronia Cega):** Dê play no vídeo e tente falar os seus "Lá-lá-lás" exatamente em cima da voz do ator original, cravando as pausas e o final da frase.\n4.  **Passo 4:** Quando você consegue imitar a métrica perfeitamente com "Lá-lá-lá", encaixar as palavras em português no roteiro se torna muito mais fácil.`
      },
      {
        id: 'c4-l3',
        title: '3. Adaptação de Texto na Bancada',
        duration: '20 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Quando a tradução não cabe\n\nO tradutor faz o texto base, mas o dublador e o diretor fazem a adaptação final na bancada (no estúdio) para garantir que a frase caiba perfeitamente na boca do ator.\n\n**O Problema do Tamanho:** O inglês costuma ser mais curto e direto que o português.\n*   *Original (Inglês):* "I absolutely do not agree with that." (Boca longa, muitas sílabas)\n*   *Tradução literal:* "Eu não concordo com isso." (Boca curta, termina antes do ator fechar a boca na tela)\n*   *Adaptação na bancada:* "Eu definitivamente não concordo com isso." (Adiciona-se uma palavra para preencher o tempo de boca, mantendo o sentido).\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Praticar a adaptação de texto para "esticar" ou "encurtar" frases.\n\n1.  **Passo 1 (A Frase Base):** Pegue a frase: "Ele foi para casa." (Curta).\n2.  **Passo 2 (O Desafio de Esticar):** Imagine que o ator na tela continuou movendo a boca por mais 2 segundos. Como você adaptaria essa frase para dizer a mesma coisa, mas usando mais palavras? (Ex: "Ele acabou de ir lá para a casa dele").\n3.  **Passo 3 (A Frase Base 2):** Pegue a frase: "Eu não tenho a menor ideia de onde ele está." (Longa).\n4.  **Passo 4 (O Desafio de Encurtar):** Imagine que o ator na tela falou muito rápido e fechou a boca. Como você encurta essa frase mantendo o sentido? (Ex: "Não sei onde ele tá" ou "Faço ideia não").\n5.  **Passo 5:** A habilidade de pensar em sinônimos e reestruturar frases em segundos é o que diferencia um bom dublador na bancada.'
      }
    ]
  },
  {
    id: 'interpretacao-dublagem',
    title: 'Interpretação para Dublagem',
    description: 'Técnicas teatrais aplicadas ao microfone. Aprenda a transmitir emoção apenas com a voz.',
    category: 'Dublagem',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Avançado',
    lessons: [
      {
        id: 'c5-l1',
        title: '1. A Intenção e o Subtexto',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O que não está escrito\n\nNa dublagem, você não está apenas lendo palavras em um papel; você está transmitindo a intenção, a alma e o momento do ator original.\n\n*   **O Subtexto:** É o que o personagem *realmente* quer dizer, mesmo que as palavras digam o contrário. A emoção está no subtexto. (Ex: Um "Tudo bem" dito com raiva contida vs. um "Tudo bem" dito com alívio após um susto. As palavras são as mesmas, a atuação é oposta).\n*   **A "Cama" Emocional:** Antes de abrir a boca para gravar, você precisa entrar na mesma vibração emocional do personagem na tela. Se ele está correndo de um monstro, seu corpo precisa estar tenso e sua respiração ofegante antes da primeira palavra.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Praticar a entrega de diferentes subtextos usando a mesma frase.\n\n1.  **Passo 1 (A Frase Neutra):** Escreva a frase: "Eu não acredito que você fez isso."\n2.  **Passo 2 (Subtexto 1 - Raiva Fria):** Imagine que um colega apagou seu projeto de propósito. Diga a frase com ódio contido, articulando bem as palavras, quase sussurrando.\n3.  **Passo 3 (Subtexto 2 - Alegria Extrema):** Imagine que seu parceiro comprou um carro novo de surpresa para você. Diga a frase com choque, rindo, quase sem fôlego.\n4.  **Passo 4 (Subtexto 3 - Decepção Profunda):** Imagine que seu melhor amigo mentiu para você. Diga a frase com a voz embargada, quase chorando, olhando para o chão.\n5.  **Passo 5:** Grave as três versões. Note como a intenção muda completamente o tom, o volume e o ritmo da mesma frase.'
      },
      {
        id: 'c5-l2',
        title: '2. Animação vs. Live Action',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Diferentes Registros de Atuação\n\nA forma como você atua muda drasticamente dependendo do estilo visual da obra.\n\n*   **Live Action (Filmes/Séries com atores reais):** A interpretação deve ser extremamente naturalista. Você deve "colar" na voz, na respiração e na sutileza do ator original. Se ele sussurra, você sussurra. Menos é mais. O objetivo é que o público esqueça que é dublado.\n*   **Animação (Cartoons/Animes):** Exige uma energia muito maior (overacting). A voz precisa preencher o desenho, que muitas vezes é exagerado. A articulação é mais marcada, as reações (sustos, risadas) são maiores e mais teatrais. Você tem liberdade para criar vozes caricatas.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Alternar entre o registro naturalista (Live Action) e o exagerado (Animação).\n\n1.  **Passo 1 (O Texto):** Pegue a frase: "Cuidado! Aquela coisa está vindo na nossa direção! Corram!"\n2.  **Passo 2 (Modo Live Action):** Imagine que você está em um filme de terror realista (tipo "Um Lugar Silencioso"). Diga a frase sussurrando com pânico real, respiração ofegante, tentando não fazer barulho.\n3.  **Passo 3 (Modo Cartoon):** Imagine que você é um personagem de desenho animado (tipo "Bob Esponja" ou "Pernalonga"). Diga a mesma frase gritando, com a voz esganiçada, prolongando as vogais ("Cuiidaaadooo!"), de forma cômica e exagerada.\n4.  **Passo 4:** Grave as duas versões e ouça. A diferença de energia e colocação vocal deve ser gritante.'
      },
      {
        id: 'c5-l3',
        title: '3. Projeção, Sorriso na Voz e Expressão Corporal',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Corpo Fala no Microfone\n\nNa dublagem, você está parado em frente a um microfone, mas o seu corpo não pode estar "morto". Mesmo que o público não veja você, ele "ouve" o seu corpo através da sua voz.\n\n*   **O Sorriso na Voz:** Se o personagem está sorrindo na tela, você DEVE sorrir fisicamente no estúdio. A anatomia do sorriso levanta as maçãs do rosto, muda o formato do trato vocal e clareia o som da voz. É impossível simular um sorriso verdadeiro na voz mantendo o rosto sério.\n*   **Expressão Corporal Contida:** Se o personagem está correndo, mova os braços levemente (sem fazer barulho de roupa). Se ele está curvado e triste, curve seus ombros. A postura física altera a compressão do diafragma e a ressonância da voz.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Comprovar como a expressão facial altera fisicamente o som da voz.\n\n1.  **Passo 1 (A Frase):** Use a frase: "Bom dia, é muito bom ver você de novo."\n2.  **Passo 2 (A Cara Fechada):** Feche a cara, franza a testa, deixe os lábios retos e tensos. Diga a frase tentando soar feliz, mas mantendo o rosto completamente sério e bravo. Grave no celular.\n3.  **Passo 3 (O Sorriso Largo):** Agora, abra o maior sorriso que conseguir, mostrando os dentes. Levante as sobrancelhas. Diga a mesma frase com esse sorriso enorme no rosto. Grave no celular.\n4.  **Passo 4 (A Comparação):** Ouça as duas gravações de olhos fechados. A segunda gravação soará infinitamente mais simpática, brilhante e acolhedora, simplesmente porque a anatomia do seu rosto mudou o formato do som.'
      }
    ]
  },
  {
    id: 'mercado-games',
    title: 'Mercado de Games e Localização',
    description: 'Entenda os desafios únicos de dublar videogames, desde a leitura de waveforms até os esforços vocais extremos.',
    category: 'Carreira',
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Avançado',
    lessons: [
      {
        id: 'c6-l1',
        title: '1. Dublagem "Cega" e Waveforms',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Desafio do Áudio Original\n\nDiferente de filmes (onde você assiste a cena), em games você muitas vezes dubla "no escuro", ouvindo apenas a onda sonora (waveform) do áudio original em inglês e lendo planilhas de Excel.\n\n*   **Lendo a Onda (Waveform):** Você precisa igualar a energia, o volume e a duração exata da onda sonora que aparece na tela do software de gravação. Se a onda original começa forte e vai sumindo, sua voz deve fazer o mesmo.\n*   **Restrição de Tempo (Time Constraint):** Essa é a regra de ouro dos games. O áudio em português não pode ser nem 1 milissegundo maior que o áudio original. Se o arquivo original tem 2.5 segundos, sua fala deve caber em 2.5 segundos, senão o áudio corta no meio do jogo.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Praticar a restrição de tempo extrema (Time Constraint).\n\n1.  **Passo 1 (O Cronômetro):** Abra o cronômetro do seu celular.\n2.  **Passo 2 (A Frase Original):** Diga a frase "I need backup right now!" (Preciso de reforços agora!) em inglês, em velocidade normal. Deve durar cerca de 1.5 a 2 segundos.\n3.  **Passo 3 (O Desafio):** A tradução é: "Eu preciso de reforços imediatamente!".\n4.  **Passo 4 (A Execução):** Inicie o cronômetro e tente dizer a frase em português cravando exatamente no mesmo tempo da frase em inglês (menos de 2 segundos), sem soar embolado. Você precisará acelerar a dicção e usar muito apoio diafragmático para manter a clareza.'
      },
      {
        id: 'c6-l2',
        title: '2. Esforços Vocais (Kinetics)',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### Gritos, Socos e Quedas\n\nGames exigem a gravação de dezenas (às vezes centenas) de "esforços" (kinetics) seguidos: dano leve, dano médio, dano fatal, ataque forte, ataque fraco, pulo, morte por fogo, morte por queda.\n\n*   **O Risco Vocal:** É aqui que a fonoaudiologia salva sua carreira. Gritar ou fazer sons de engasgo usando a garganta vai destruir suas cordas vocais em 10 minutos. Você perderá a voz para o resto da semana.\n*   **A Técnica:** A força do grito ou do esforço DEVE vir do abdômen (apoio diafragmático). Você usa muito ar e pouca tensão no pescoço. Além disso, beba muita água e peça ao diretor para gravar os gritos de morte no final da sessão.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Criar um vocabulário de sons de esforço (kinetics) com segurança.\n\n1.  **Passo 1 (A Preparação):** Fique de pé, coloque as mãos nas costelas e respire fundo, ativando o apoio diafragmático.\n2.  **Passo 2 (O Pulo):** Faça 3 sons curtos e diferentes para a ação de "pular um muro alto" (Ex: "Hup!", "Ugh!", "Ha!"). A força deve vir da barriga contraindo, não da garganta arranhando.\n3.  **Passo 3 (O Dano Leve):** Faça 3 sons rápidos de "levar um soco no ombro" (Ex: "Ah!", "Tsc!", "Uh!").\n4.  **Passo 4 (A Queda):** Faça 1 som longo de "cair de um prédio e bater as costas no chão", expulsando todo o ar dos pulmões de uma vez ("Oooooof!").\n5.  **Passo 5:** Avalie: Sua garganta doeu ou arranhou? Se sim, você fez errado. A força deve estar toda no seu abdômen.'
      }
    ]
  },
  {
    id: 'home-studio',
    title: 'Home Studio Profissional',
    description: 'Como montar seu próprio estúdio em casa com qualidade broadcast para atender clientes do mundo todo.',
    category: 'Carreira',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 'Intermediário',
    lessons: [
      {
        id: 'c7-l1',
        title: '1. Tratamento Acústico vs. Isolamento',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### A Diferença Fundamental\n\nMuitos iniciantes gastam dinheiro errado confundindo isolamento com tratamento.\n\n*   **Isolamento Acústico:** Impede que o som de fora (ônibus, cachorro, vizinho) entre no seu microfone, e que o seu grito saia do quarto. Requer obras pesadas (paredes duplas de drywall, lã de rocha interna, portas maciças, janelas antirruído). É muito caro.\n*   **Tratamento Acústico:** Impede que o som da sua própria voz bata nas paredes lisas do quarto e volte para o microfone (o famoso eco ou reverb). É feito com espumas acústicas grossas, painéis absorvedores, bass traps, tapetes e cobertores pesados. É mais barato e essencial para começar.\n\nPara dublagem, o áudio deve ser "seco" (dead room), sem nenhum eco da sala, para que o engenheiro de som do estúdio possa adicionar os efeitos do filme depois.\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Avaliar a acústica atual do seu ambiente de gravação.\n\n1.  **Passo 1 (O Teste da Palma):** Vá para o centro do cômodo onde você pretende montar seu Home Studio. Fique em silêncio por 5 segundos.\n2.  **Passo 2 (A Execução):** Bata uma palma única, muito forte e seca.\n3.  **Passo 3 (A Escuta):** Preste muita atenção ao som que vem *depois* da palma. Você ouve um som metálico "zumbindo" no ar? O som demora a sumir? Isso é a reverberação (eco).\n4.  **Passo 4 (A Solução Caseira):** Abra as portas do seu guarda-roupas (cheio de roupas). Coloque a cabeça lá dentro e bata uma palma. O som "morre" imediatamente, sem eco. Esse é o som "seco" que você precisa replicar no seu quarto usando tratamento acústico (painéis, cobertores, móveis).'
      },
      {
        id: 'c7-l2',
        title: '2. Equipamentos Essenciais',
        duration: '15 min',
        mediaType: 'slide',
        slideBgUrl: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        content: '### O Setup Padrão da Indústria\n\nPara entregar áudio profissional para estúdios (especialmente internacionais), você precisa de equipamentos específicos. Microfones de fone de ouvido ou USB baratos não servem.\n\n*   **Microfone:** O padrão é o Condensador de Diafragma Largo (ex: Rode NT1, Audio-Technica AT2020, ou o caríssimo Neumann U87). Eles captam todas as nuances da voz, mas exigem conexão XLR.\n*   **Interface de Áudio:** É a "placa de som" externa. Ela recebe o cabo XLR do microfone, fornece energia para ele (Phantom Power 48V) e converte o som analógico em digital com alta qualidade para o computador (ex: Focusrite Scarlett Solo, SSL 2, Audient iD4).\n*   **Fones de Ouvido:** Devem ser Fechados (Closed-back). Se você usar fones abertos, o som do filme que você está ouvindo vai "vazar" e ser captado pelo microfone, arruinando a gravação (ex: Audio-Technica ATH-M50x, Sony MDR-7506).\n\n---\n\n### 🛠️ Exercício de Fixação (Passo a Passo)\n\n**Objetivo:** Montar um orçamento realista para o seu Home Studio.\n\n1.  **Passo 1 (A Pesquisa do Microfone):** Pesquise o preço atual de um microfone "Audio-Technica AT2020" (versão XLR, não a USB) ou um "Rode NT1". Anote o valor.\n2.  **Passo 2 (A Pesquisa da Interface):** Pesquise o preço de uma interface de áudio "Focusrite Scarlett Solo" (3ª ou 4ª geração). Anote o valor.\n3.  **Passo 3 (A Pesquisa do Fone):** Pesquise o preço de um fone de ouvido "Audio-Technica ATH-M20x" (modelo de entrada fechado). Anote o valor.\n4.  **Passo 4 (O Orçamento Total):** Some os três valores. Adicione cerca de R$ 200 para um cabo XLR de boa qualidade e um pedestal de mesa. Esse é o seu investimento inicial mínimo para ter qualidade de áudio aceita internacionalmente.'
      }
    ]
  }
];

export const courses: Course[] = [
  ...originalCourses,
  ...coursesPart2,
  ...coursesPart3,
  ...coursesPart4,
  ...coursesPart5,
  ...coursesPart6,
  ...coursesPart7
];

