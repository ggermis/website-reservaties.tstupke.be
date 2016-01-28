#!/bin/bash

ROOT_DIR="${1:?No root directory specified}"
PHP=$(which php)

"$PHP" "${ROOT_DIR}/backend/scripts/incoming_emails.php"