#!/bin/bash

export MYSQL_PWD="mat82260"
/usr/bin/mysqldump --skip-add-locks --user=paulym_tstupke paulym_tstupke > /home/paulym/backups/paulym_tstupke-$(date +"%Y%m%d").sql