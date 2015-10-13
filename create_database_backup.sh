#!/bin/bash

/usr/bin/mysqldump --skip-add-locks --user=paulym_tstupke --password=mat82260 paulym_tstupke > /home/paulym/backups/paulym_tstupke-$(date +"%Y%m%d").sql