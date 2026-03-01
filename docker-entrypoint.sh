#!/bin/sh
set -e

# Veritabanı yoksa hazır DB'yi volume'a kopyala
if [ ! -f /app/data/dev.db ]; then
  echo ">>> Veritabanı bulunamadı, hazır DB kopyalanıyor..."
  cp /app/seed.db /app/data/dev.db
  echo ">>> Veritabanı hazır."
else
  echo ">>> Mevcut veritabanı bulundu."
fi

exec "$@"
