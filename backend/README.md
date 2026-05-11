# FinCore API 🏦

API REST para gestão de clientes e transações financeiras, desenvolvida com Spring Boot e MySQL.

## 📋 Sobre o Projeto

FinCore é uma aplicação bancária que permite gerenciar clientes, contas e transações financeiras com segurança e controle transacional ACID. O sistema implementa autenticação JWT e oferece endpoints para operações de depósito, transferência e consulta de extratos.

## 🚀 Tecnologias Utilizadas

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** com JWT
- **Spring Data JPA**
- **MySQL 8.0**
- **Flyway** para migrations
- **MapStruct** para mapeamento de entidades
- **Lombok** para redução de boilerplate
- **Swagger/OpenAPI** para documentação
- **Docker Compose** para containerização

## 📦 Funcionalidades

### Módulo de Autenticação
- ✅ Registro de usuários (ADMIN/USER)
- ✅ Login com geração de token JWT
- ✅ Autenticação baseada em Bearer Token

### Módulo de Clientes
- ✅ Cadastro de clientes (CPF/CNPJ)
- ✅ Consulta de clientes por UUID
- ✅ Listagem paginada de clientes
- ✅ Validação de unicidade de documento e email

### Módulo de Contas
- ✅ Criação de contas (CORRENTE, POUPANÇA, PAGAMENTO)
- ✅ Geração automática de número de conta
- ✅ Listagem paginada de contas
- ✅ Controle de saldo

### Módulo de Transações
- ✅ Depósitos
- ✅ Transferências entre contas
- ✅ Extrato paginado por conta
- ✅ Controle de concorrência com locks pessimistas
- ✅ Garantia de atomicidade (ACID)

## 🏗️ Arquitetura

```
fincore/
├── api/
│   ├── controller/      # Endpoints REST
│   ├── dto/            # DTOs de request/response
│   ├── exception/      # Tratamento global de exceções
│   └── mapper/         # MapStruct mappers
├── core/
│   ├── entity/         # Entidades JPA
│   ├── repository/     # Repositórios Spring Data
│   ├── service/        # Lógica de negócio
│   └── security/       # Configuração de segurança
└── config/             # Configurações gerais
```

## 🔧 Configuração e Execução

### Pré-requisitos
- Java 17 ou superior
- Docker e Docker Compose
- Maven

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fincore.git
cd fincore
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MYSQL_DATABASE=fincore_db
MYSQL_ROOT_PASSWORD=root_password
MYSQL_USER=api_user
MYSQL_PASSWORD=api_password
MYSQL_PORT=3306

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/fincore_db
SPRING_DATASOURCE_USERNAME=api_user
SPRING_DATASOURCE_PASSWORD=api_password

SERVER_PORT=8080
JWT_SECRET=seu-secret-key-super-seguro
```

### 3. Inicie o banco de dados

```bash
docker-compose up -d
```

### 4. Execute a aplicação

```bash
mvn clean install
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação interativa do Swagger:

```
http://localhost:8080/swagger-ui.html
```

## 🔐 Endpoints Principais

### Autenticação
```http
POST /v1/auth/register
POST /v1/auth/login
```

### Clientes
```http
POST   /v1/customers
GET    /v1/customers
GET    /v1/customers/{uuid}
```

### Contas
```http
POST   /v1/accounts
GET    /v1/accounts
```

### Transações
```http
POST   /v1/transactions/deposit
POST   /v1/transactions/transfer
GET    /v1/transactions/statement/{accountUuid}
```

## 📝 Exemplos de Uso

### 1. Registrar um usuário

```bash
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123",
    "role": "USER"
  }'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Criar um cliente

```bash
curl -X POST http://localhost:8080/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "fullName": "João Silva",
    "documentNumber": "12345678901",
    "email": "joao@example.com"
  }'
```

### 4. Criar uma conta

```bash
curl -X POST http://localhost:8080/v1/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "customerUuid": "uuid-do-cliente",
    "type": "CORRENTE"
  }'
```

### 5. Realizar um depósito

```bash
curl -X POST http://localhost:8080/v1/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "accountUuid": "uuid-da-conta",
    "amount": 1000.00
  }'
```

### 6. Realizar uma transferência

```bash
curl -X POST http://localhost:8080/v1/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "sourceAccountUuid": "uuid-conta-origem",
    "destinationAccountUuid": "uuid-conta-destino",
    "amount": 500.00,
    "description": "Pagamento de aluguel"
  }'
```

### 7. Consultar extrato

```bash
curl -X GET "http://localhost:8080/v1/transactions/statement/uuid-da-conta?page=0&size=10" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🗄️ Modelo de Dados

### Principais Entidades

**Customer (Cliente)**
- UUID, nome completo, CPF/CNPJ, email
- Status: ACTIVE, INACTIVE, BLOCKED

**Account (Conta)**
- UUID, número da conta, agência, saldo
- Tipos: CORRENTE, POUPANCA, PAGAMENTO
- Relacionamento: ManyToOne com Customer

**FinancialTransaction (Transação)**
- UUID, valor, tipo, descrição
- Tipos: DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT
- Relacionamentos: ManyToOne com Account (origem e destino)

**User (Usuário)**
- UUID, email, senha (BCrypt), role
- Roles: ADMIN, USER

## 🔒 Segurança

- **Autenticação JWT**: Tokens com validade de 2 horas
- **BCrypt**: Hash de senhas
- **Locks Pessimistas**: Controle de concorrência em transferências
- **Transações ACID**: Garantia de consistência dos dados
- **Validações**: Bean Validation em todos os endpoints

## ⚙️ Configurações Importantes

### application.yml

O projeto utiliza variáveis de ambiente para maior flexibilidade:

- `SPRING_DATASOURCE_URL`: URL do banco de dados
- `SPRING_DATASOURCE_USERNAME`: Usuário do banco
- `SPRING_DATASOURCE_PASSWORD`: Senha do banco
- `SERVER_PORT`: Porta da aplicação (padrão: 8080)
- `JWT_SECRET`: Chave secreta para geração de tokens

## 🧪 Testes

```bash
mvn test
```

## 🐳 Docker

### Construir imagem da aplicação

```bash
docker build -t fincore-api .
```

### Executar com Docker Compose

```bash
docker-compose up
```

## 📊 Monitoramento e Logs

A aplicação utiliza SLF4J e Log4j2 para logging. Os níveis de log podem ser configurados no `application.yml`:

```yaml
logging:
  level:
    br.leetjourney.fincore: DEBUG
    org.springframework.security: DEBUG
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**LeetJourney**
- Email: leetjourney@gmail.com
- GitHub:(https://github.com/alexanderbs3)

## 🐛 Problemas Conhecidos e Soluções

### Erro de conexão com MySQL
- Certifique-se de que o Docker está rodando
- Verifique se as credenciais no `.env` estão corretas
- Aguarde o healthcheck do container MySQL finalizar

### Token JWT inválido
- Verifique se o token está sendo enviado no header `Authorization: Bearer TOKEN`
- Tokens expiram após 2 horas

### Saldo insuficiente em transferências
- Este é um comportamento esperado para garantir a integridade dos dados
- Verifique o saldo antes de realizar transferências

## 🔄 Roadmap

- [ ] Implementar saques
- [ ] Adicionar suporte a PIX
- [ ] Criar dashboard de administração
- [ ] Implementar notificações por email
- [ ] Adicionar limite de crédito
- [ ] Implementar auditoria de transações
- [ ] Criar relatórios financeiros


