#!/bin/bash

export MYSQL_PWD="${1:?No password specified}"
/usr/bin/mysqldump --skip-add-locks --user=paulym_tstupke paulym_tstupke > /home/paulym/backups/paulym_tstupke-$(date +"%Y%m%d").sql