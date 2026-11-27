# Drip Store — Back-end

API REST de e-commerce desenvolvida com Node.js, Express, MySQL, Sequelize e JWT.

## Requisitos
- Node.js LTS instalado
- MySQL Server instalado e em execução
- npm (no PowerShell do Windows, use `npm.cmd` caso a política bloqueie `npm`)

## Instalação
1. Copie `.env.example` para `.env`.
2. Preencha os dados do MySQL e defina uma chave JWT longa e aleatória. Não compartilhe o `.env`.
3. Crie o banco no MySQL: `CREATE DATABASE drip_store;`
4. Instale dependências: `npm.cmd install`
5. Execute as migrations: npm.cmd run db:migrate
6. Inicie em desenvolvimento: `npm.cmd run dev`

A API ficará em `http://localhost:3000`. Verifique a inicialização em `GET /health`.

## Autenticação
1. Cadastre um usuário em `POST /v1/user`.
2. Faça login em `POST /v1/user/token` enviando `email` e `password`.
3. Envie `Authorization: Bearer SEU_TOKEN` nas rotas POST, PUT e DELETE protegidas.

## Rotas principais
- Usuários: `POST /v1/user`, `GET /v1/user/:id`, `PUT /v1/user/:id`, `DELETE /v1/user/:id`, `POST /v1/user/token`.
- Categorias: `GET /v1/category/search`, `GET /v1/category/:id`, `POST /v1/category`, `PUT /v1/category/:id`, `DELETE /v1/category/:id`.
- Produtos: `GET /v1/product/search`, `GET /v1/product/:id`, `POST /v1/product`, `PUT /v1/product/:id`, `DELETE /v1/product/:id`.

## Documentação da API

A documentação interativa está disponível pelo Swagger UI:

http://localhost:3000/api-docs

A interface permite visualizar os endpoints, parâmetros,
respostas e testar as operações da API.

Os filtros de listagem incluem paginação, seleção de campos, busca textual e filtros de preço/categoria/opção descritos no enunciado.

## Testes automatizados
Execute `npm.cmd test`. Os testes cobrem geração de slug, paginação/seleção de campos, middleware JWT, fluxo do controller de login e filtros de opções dos produtos. Os testes não exigem conexão com MySQL; as dependências do projeto precisam estar instaladas. Execute `npm.cmd test` no Windows.

## Banco de dados e migrations

O projeto utiliza Sequelize para mapeamento e gerenciamento do banco de dados MySQL.

Para executar as migrations pendentes:

npm.cmd run db:migrate

Para verificar o status das migrations:

npm.cmd run db:migrate:status

As migrations ficam armazenadas na pasta `migrations`.
O histórico de execução é registrado na tabela `SequelizeMeta`.

O comando `db:sync` está disponível para sincronização durante o desenvolvimento.

## Observações técnicas
- Senhas são armazenadas com hash bcrypt e não são devolvidas nas respostas.
- O login consulta o usuário sem o escopo padrão de ocultação de senha para que o hash esteja disponível apenas internamente para `bcrypt.compare`.
- Imagens recebidas em base64 são gravadas em `uploads/`; imagens já hospedadas por URL mantêm a URL ao serem devolvidas pela API.
- Os filtros `option[ID]` são aplicados individualmente com `EXISTS`, sem duplicar o relacionamento de opções na consulta.
- Os preços seguem o tipo FLOAT especificado no enunciado.
- Falhas de autenticação retornam 401. O texto do enunciado apresenta uma divergência pontual entre 400 e 401; os CRUDs protegidos especificam 401.
- `db:sync` é destinado ao desenvolvimento. Em produção, devem ser usadas migrations versionadas.
