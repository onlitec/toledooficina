# Backups do Sistema ToledoOficina

Este diretório contém os backups do sistema ToledoOficina.

## Informações sobre os backups

- Os backups são gerados no formato `.tar.gz`
- Nomenclatura: `toledooficina_backup_YYYYMMDD_HHMMSS.tar.gz`
- Conteúdo: diretórios `backend`, `frontend`, `nginx`, `scripts` e arquivos de configuração

## Exclusões

Os seguintes diretórios e arquivos são excluídos dos backups para reduzir o tamanho:

- `.git`
- `venv`
- `node_modules`
- `__pycache__`
- `*.pyc`
- `data`
- `logs`
- `backup`
- `backup_old`
- `instance`
- `secrets`
- `nginx/cache`

## Restauração

Para restaurar um backup, use o comando:

```bash
tar -xzvf backups/nome_do_arquivo_backup.tar.gz -C /caminho/para/restauracao
```
