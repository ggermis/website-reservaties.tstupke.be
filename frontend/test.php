<?php

require_once(realpath(dirname(__FILE__) . '/../config.php'));

$mail = imap_open('{' . __INCOMING_MAIL_SERVER__ . ':' . __INCOMING_MAIL_PORT__ . '/pop3/novalidate-cert}INBOX', __INCOMING_MAIL_USERNAME__, __INCOMING_MAIL_PASSWORD__);

print_r($mail);

imap_close($mail);
?>