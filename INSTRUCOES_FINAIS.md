# 🎉 ERP Oficina Mecânica - Pronto para Execução!

## ✅ Status: Completamente preparado

**Localização:** /home/alfreire/toledooficina
**Sistema:** Ubuntu 24.10

## 🚀 Como Executar

### Opção 1: Script Automático
```bash
cd /home/alfreire/toledooficina
./executar_erp.sh
```

### Opção 2: Comandos Manuais
```bash
cd /home/alfreire/toledooficina
docker-compose up --build -d
# ou com sudo se necessário:
sudo docker-compose up --build -d
```

## 🌐 Acessos
- Frontend: http://localhost
- Backend: http://localhost/api

## 🔧 Comandos Úteis
- Ver status: docker-compose ps
- Ver logs: docker-compose logs -f
- Parar: docker-compose down

## 🔐 Se houver erro de permissão Docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---
Sistema preparado e validado com sucesso!
