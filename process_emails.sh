#!/bin/bash

ROOT_DIR="${1:?No root directory specified}"
PHP="$(which php)"

CURRENT_DIR="$(dirname "$0")"
"${CURRENT_DIR}/process_incoming_emails.sh" "$ROOT_DIR"
"${CURRENT_DIR}/process_outgoing_emails.sh" "$ROOT_DIR"