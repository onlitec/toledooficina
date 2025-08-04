# Detalhamento dos Cadastros do ERP Oficina Mecânica

Este documento detalha as funcionalidades e campos para cada módulo de cadastro do sistema ERP da oficina mecânica.

## 1. Clientes

### Funcionalidades:
- Cadastro de Pessoa Física (PF) e Pessoa Jurídica (PJ).
- Busca e filtragem por nome, CPF/CNPJ, telefone, e-mail.
- Visualização detalhada do cliente com histórico de serviços e veículos associados.
- Edição e exclusão de clientes.
- Validação de CPF/CNPJ.

### Campos:
- **Tipo de Pessoa**: (PF/PJ) - *Obrigatório*
- **Nome/Razão Social**: (Texto) - *Obrigatório*
- **CPF/CNPJ**: (Texto, formatado) - *Obrigatório, único*
- **RG/Inscrição Estadual**: (Texto)
- **Data de Nascimento/Fundação**: (Data)
- **Telefone**: (Texto, formatado) - *Obrigatório*
- **Celular**: (Texto, formatado)
- **E-mail**: (Texto, formato de e-mail) - *Obrigatório, único*
- **Endereço**: (Texto)
- **Número**: (Texto)
- **Complemento**: (Texto)
- **Bairro**: (Texto)
- **Cidade**: (Texto)
- **Estado**: (Texto, UF)
- **CEP**: (Texto, formatado)
- **Observações**: (Texto longo)
- **Status**: (Ativo/Inativo) - *Padrão: Ativo*

## 2. Veículos

### Funcionalidades:
- Cadastro de veículos associados a um cliente.
- Busca e filtragem por placa, marca, modelo, ano, cliente.
- Visualização detalhada do veículo com histórico de manutenções e ordens de serviço.
- Edição e exclusão de veículos.
- Validação de placa (Mercosul e padrão antigo).

### Campos:
- **Cliente Associado**: (Referência ao Cliente) - *Obrigatório*
- **Placa**: (Texto, formatado) - *Obrigatório, único*
- **Marca**: (Texto) - *Obrigatório*
- **Modelo**: (Texto) - *Obrigatório*
- **Ano Fabricação**: (Número, 4 dígitos) - *Obrigatório*
- **Ano Modelo**: (Número, 4 dígitos)
- **Cor**: (Texto)
- **Chassi**: (Texto, único)
- **Renavam**: (Texto, único)
- **Tipo de Combustível**: (Dropdown: Gasolina, Etanol, Flex, Diesel, Elétrico, Híbrido)
- **Quilometragem Atual**: (Número)
- **Data Última Revisão**: (Data)
- **Observações**: (Texto longo)
- **Status**: (Ativo/Inativo) - *Padrão: Ativo*

## 3. Estoque de Peças e Insumos

### Funcionalidades:
- Cadastro de peças e insumos com controle de estoque.
- Registro de entrada e saída de itens (movimentações).
- Alerta de estoque baixo.
- Busca e filtragem por nome, código, categoria, fornecedor.
- Edição e exclusão de itens.
- Relatórios de movimentação e inventário.

### Campos:
- **Nome do Item**: (Texto) - *Obrigatório*
- **Código do Item**: (Texto, único) - *Obrigatório*
- **Descrição**: (Texto longo)
- **Categoria**: (Referência à Categoria) - *Obrigatório*
- **Fornecedor Principal**: (Referência ao Fornecedor)
- **Preço de Compra**: (Número, monetário) - *Obrigatório*
- **Preço de Venda**: (Número, monetário) - *Obrigatório*
- **Quantidade Atual**: (Número inteiro) - *Obrigatório*
- **Quantidade Mínima**: (Número inteiro, para alerta de estoque baixo) - *Obrigatório*
- **Unidade de Medida**: (Dropdown: UN, KG, L, M, PCT, etc.) - *Obrigatório*
- **Localização no Estoque**: (Texto)
- **Data de Validade**: (Data, opcional)
- **Observações**: (Texto longo)
- **Status**: (Ativo/Inativo) - *Padrão: Ativo*

### Sub-módulo: Categorias
- **Nome da Categoria**: (Texto, único) - *Obrigatório*
- **Descrição**: (Texto)

### Sub-módulo: Fornecedores
- **Nome/Razão Social**: (Texto) - *Obrigatório*
- **CNPJ**: (Texto, formatado, único)
- **Telefone**: (Texto)
- **E-mail**: (Texto)
- **Endereço**: (Texto)
- **Observações**: (Texto longo)

## 4. Ferramentas

### Funcionalidades:
- Cadastro de ferramentas com controle de inventário.
- Registro de empréstimos e devoluções.
- Agendamento e registro de manutenções.
- Alerta para ferramentas que precisam de manutenção.
- Busca e filtragem por nome, código, status, localização.
- Edição e exclusão de ferramentas.

### Campos:
- **Nome da Ferramenta**: (Texto) - *Obrigatório*
- **Código de Identificação**: (Texto, único) - *Obrigatório*
- **Descrição**: (Texto longo)
- **Tipo**: (Dropdown: Manual, Elétrica, Pneumática, Medição, etc.)
- **Marca**: (Texto)
- **Modelo**: (Texto)
- **Número de Série**: (Texto, único)
- **Localização na Oficina**: (Texto) - *Obrigatório*
- **Status**: (Disponível, Em Uso, Em Manutenção, Emprestada, Danificada) - *Padrão: Disponível*
- **Data Última Manutenção**: (Data)
- **Frequência Manutenção (dias)**: (Número inteiro)
- **Observações**: (Texto longo)

### Sub-módulo: Empréstimos
- **Ferramenta**: (Referência à Ferramenta) - *Obrigatório*
- **Responsável**: (Referência ao Usuário/Funcionário) - *Obrigatório*
- **Data Empréstimo**: (Data e Hora) - *Obrigatório*
- **Data Devolução Prevista**: (Data e Hora)
- **Data Devolução Real**: (Data e Hora)
- **Observações**: (Texto longo)

### Sub-módulo: Manutenções
- **Ferramenta**: (Referência à Ferramenta) - *Obrigatório*
- **Tipo de Manutenção**: (Dropdown: Preventiva, Corretiva, Calibração)
- **Data Manutenção**: (Data) - *Obrigatório*
- **Custo**: (Número, monetário)
- **Descrição do Serviço**: (Texto longo)
- **Realizado Por**: (Texto)

## 5. Ordens de Serviço (OS)

### Funcionalidades:
- Criação de OS detalhadas com cliente, veículo, serviços e peças.
- Controle de status da OS (Aberta, Em Andamento, Aguardando Peça, Concluída, Cancelada).
- Geração de orçamentos e aprovação pelo cliente.
- Registro de mão de obra e tempo gasto.
- Histórico de OS por cliente e veículo.
- Geração de PDF da OS.

### Campos:
- **Número da OS**: (Texto, gerado automaticamente, único) - *Obrigatório*
- **Cliente**: (Referência ao Cliente) - *Obrigatório*
- **Veículo**: (Referência ao Veículo) - *Obrigatório*
- **Data Abertura**: (Data e Hora) - *Padrão: Data/Hora atual*
- **Data Conclusão Prevista**: (Data)
- **Data Conclusão Real**: (Data)
- **Status**: (Dropdown: Aberta, Em Andamento, Aguardando Peça, Concluída, Cancelada) - *Padrão: Aberta*
- **Descrição do Problema/Serviço Solicitado**: (Texto longo) - *Obrigatório*
- **Observações Internas**: (Texto longo)
- **Valor Total Peças**: (Calculado)
- **Valor Total Serviços**: (Calculado)
- **Valor Total Mão de Obra**: (Calculado)
- **Valor Total OS**: (Calculado) - *Obrigatório*
- **Desconto**: (Número, monetário ou percentual)
- **Valor Final**: (Calculado)
- **Aprovado pelo Cliente**: (Booleano)
- **Data Aprovação**: (Data e Hora)

### Sub-módulo: Itens de Serviço (Mão de Obra)
- **OS Associada**: (Referência à OS) - *Obrigatório*
- **Descrição do Serviço**: (Texto) - *Obrigatório*
- **Tempo Gasto (horas)**: (Número, decimal)
- **Valor Hora**: (Número, monetário)
- **Valor Total do Serviço**: (Calculado)

### Sub-módulo: Peças Utilizadas
- **OS Associada**: (Referência à OS) - *Obrigatório*
- **Peça**: (Referência ao Item de Estoque) - *Obrigatório*
- **Quantidade Utilizada**: (Número inteiro) - *Obrigatório*
- **Preço Unitário**: (Número, monetário) - *Obrigatório*
- **Valor Total da Peça**: (Calculado)

## 6. Financeiro

### Funcionalidades:
- Gestão de Contas a Receber e Contas a Pagar.
- Registro de pagamentos e recebimentos.
- Fluxo de Caixa.
- Relatórios financeiros (DRE simplificado, contas por período).
- Categorização de despesas e receitas.

### Campos (Contas a Receber/Pagar - Base):
- **Descrição**: (Texto) - *Obrigatório*
- **Tipo**: (Receita/Despesa) - *Obrigatório*
- **Valor Original**: (Número, monetário) - *Obrigatório*
- **Data de Emissão**: (Data) - *Obrigatório*
- **Data de Vencimento**: (Data) - *Obrigatório*
- **Status**: (Aberto, Pago, Vencido, Cancelado) - *Padrão: Aberto*
- **Categoria Financeira**: (Referência à Categoria Financeira) - *Obrigatório*
- **Observações**: (Texto longo)

### Campos (Contas a Receber Específicos):
- **Cliente Associado**: (Referência ao Cliente, opcional)
- **OS Associada**: (Referência à OS, opcional)
- **Valor Pago**: (Número, monetário)
- **Data de Recebimento**: (Data)
- **Forma de Pagamento**: (Dropdown: Dinheiro, Cartão Crédito, Cartão Débito, Pix, Boleto, Transferência)

### Campos (Contas a Pagar Específicos):
- **Fornecedor Associado**: (Referência ao Fornecedor, opcional)
- **Valor Pago**: (Número, monetário)
- **Data de Pagamento**: (Data)
- **Forma de Pagamento**: (Dropdown: Dinheiro, Cartão Crédito, Cartão Débito, Pix, Boleto, Transferência)

### Sub-módulo: Categorias Financeiras
- **Nome da Categoria**: (Texto, único) - *Obrigatório*
- **Tipo**: (Receita/Despesa) - *Obrigatório*

## 7. Configurações

### Funcionalidades:
- Cadastro de dados da empresa (razão social, CNPJ, endereço, logotipo).
- Configuração de servidor de e-mail (SMTP) para envio de notificações.
- Configuração de notificações (estoque baixo, OS concluída, etc.).
- Gestão de usuários e permissões (futuro).
- Backup do banco de dados.

### Campos (Configuração da Empresa):
- **Razão Social**: (Texto) - *Obrigatório*
- **Nome Fantasia**: (Texto)
- **CNPJ**: (Texto, formatado) - *Obrigatório*
- **Inscrição Estadual**: (Texto)
- **Inscrição Municipal**: (Texto)
- **Telefone**: (Texto)
- **Celular**: (Texto)
- **E-mail**: (Texto)
- **Site**: (Texto)
- **Endereço**: (Texto)
- **Número**: (Texto)
- **Complemento**: (Texto)
- **Bairro**: (Texto)
- **Cidade**: (Texto)
- **Estado**: (Texto)
- **CEP**: (Texto)
- **Logotipo**: (Upload de Imagem)
- **Moeda Padrão**: (Dropdown: BRL, USD, EUR, etc.) - *Padrão: BRL*
- **Fuso Horário**: (Dropdown de fusos horários)
- **Formato de Data**: (Dropdown: DD/MM/YYYY, MM/DD/YYYY)

### Campos (Configuração de E-mail):
- **Servidor SMTP**: (Texto) - *Obrigatório*
- **Porta SMTP**: (Número inteiro) - *Obrigatório*
- **Usar TLS/SSL**: (Booleano)
- **Usuário de E-mail**: (Texto) - *Obrigatório*
- **Senha de E-mail**: (Texto, criptografado) - *Obrigatório*
- **E-mail Remetente**: (Texto) - *Obrigatório*
- **Nome Remetente**: (Texto)
- **Ativo**: (Booleano) - *Padrão: Ativo*
- **Testado**: (Booleano)
- **Data Último Teste**: (Data e Hora)

### Campos (Configuração de Notificações):
- **Notificar Ordem de Serviço Criada**: (Booleano)
- **Notificar Ordem de Serviço Concluída**: (Booleano)
- **Notificar Vencimento de Documentos (Veículos)**: (Booleano)
- **Notificar Estoque Baixo**: (Booleano)
- **Notificar Contas a Vencer**: (Booleano)
- **Notificar Manutenção de Ferramentas**: (Booleano)
- **Dias de Antecedência para Vencimento**: (Número inteiro)
- **Dias de Antecedência para Manutenção**: (Número inteiro)
- **E-mails para Notificação**: (Texto, lista de e-mails separados por vírgula)

## Próximos Passos

Com este detalhamento, o próximo passo será desenvolver/aprimorar o backend para cada um desses módulos, criando os modelos de dados e as APIs REST necessárias.

