#!/bin/bash
# Cria o diretório de montagem (se não existir)
mkdir -p /Volumes/SedeOnline

# Monta a pasta de rede com usuário e senha
mount_smbfs //admin:admin@192.168.0.2/SedeOnline /Volumes/SedeOnline

echo "Pasta SedeOnline montada em /Volumes/SedeOnline"
