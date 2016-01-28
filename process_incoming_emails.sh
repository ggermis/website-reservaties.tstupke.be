#!/bin/bash

ROOT_DIR="${1:?No root directory specified}"
PHP=$(which php)

"$PHP" "${ROOT_DIR}/frontend/api/incoming_emails.php" &> "${ROOT_DIR}/frontend/logs.txt"