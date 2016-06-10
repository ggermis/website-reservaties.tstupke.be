#!/bin/bash

ROOT_DIR="${1:?No root directory specified}"
PHP="$(which php)"

# ----
#  weekend
# ----

# 16 days after reservation, if still pending, send reminder that they have not paid yet
"$PHP" "${ROOT_DIR}/backend/scripts/outgoing_emails.php" reminder 15 pending weekend

# 2 months before arriving, send instruction email
"$PHP" "${ROOT_DIR}/backend/scripts/outgoing_emails.php" instruction 15 confirmed weekend

# 1 week before arriving, send arrival email
"$PHP" "${ROOT_DIR}/backend/scripts/outgoing_emails.php" arrival 7 confirmed weekend


# ----
#  bivak
# ----

# 16 days after reservation, if still pending, send reminder that they have not paid yet
"$PHP" "${ROOT_DIR}/backend/scripts/outgoing_emails.php" reminder 15 pending bivak

# 2 months before arriving, send instruction email
"$PHP" "${ROOT_DIR}/backend/scripts/outgoing_emails.php" instruction 15 confirmed bivak