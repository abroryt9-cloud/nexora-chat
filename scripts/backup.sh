#!/bin/bash
docker exec mongodb mongodump --out /data/backup
docker cp mongodb:/data/backup ./backup_$(date +%Y%m%d)
