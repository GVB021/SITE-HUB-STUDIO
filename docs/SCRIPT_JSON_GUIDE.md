# Procedimento de Inserção de Roteiro (JSON) e Rollback

## 1. Processo de Inserção Correto
Para garantir a integridade dos dados ao inserir ou atualizar roteiros nas produções, deve-se seguir o seguinte fluxo:

1. **Validação de Formato**: O JSON enviado deve obrigatoriamente conter um objeto raiz com uma propriedade `lines`, que deve ser um array de objetos.
2. **Schema da Linha**: Cada objeto no array `lines` deve possuir:
   - `character`: Nome do personagem (string).
   - `start`: Timecode de início (HH:MM:SS ou MM:SS).
   - `text`: Texto da fala (string).
3. **Endpoint de Atualização**: Utilizar exclusivamente o endpoint `PATCH /api/studios/:studioId/productions/:id/script`.
4. **Logs de Auditoria**: O sistema gera automaticamente um `jobId` único por tentativa de atualização, registrando o tamanho do conteúdo anterior e o número de novas linhas no log do servidor.

## 2. Garantia de Atomicidade
As operações são realizadas utilizando o Drizzle ORM com o driver `node-postgres`, garantindo que a atualização no banco de dados seja atômica. Se a conexão falhar ou o banco rejeitar a transação, nenhuma alteração parcial será aplicada.

## 3. Procedimento de Rollback em Caso de Falha

### Falha de Validação (Erro 400)
- **Causa**: JSON malformado ou estrutura incorreta.
- **Ação**: O backend rejeita a operação e retorna a mensagem de erro específica. O frontend deve notificar o usuário para correção manual.

### Falha Crítica de Sistema (Erro 500)
- **Causa**: Queda de banco de dados ou erro inesperado.
- **Ação**:
   1. Verificar os logs do servidor procurando pelo `jobId` gerado na tentativa.
   2. O log conterá o estado anterior (tamanho do string JSON).
   3. Como a operação é atômica, o banco de dados manterá a versão anterior intacta.
   4. Em caso de corrupção rara, utilize o último backup do banco de dados PostgreSQL (Supabase).

## 4. Testes de Validação
Sempre execute a suite de testes antes de alterações na lógica de roteiro:
```bash
npm test tests/script-insertion.test.ts
```
