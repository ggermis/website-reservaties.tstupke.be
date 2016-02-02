<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));

/*  2016-02-07-d451b285-03b9-4aa4-b748-9c81cbdba9b8 */
function extract_reservation_code($text) {
	$pattern = '/(\d{4}-\d{2}-\d{2}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/';
	if (preg_match($pattern, $text, $matches)) {
        return $matches[0];    
    }
	return null;
}

function find_reservation_from_code($subject, $body, $to, $date) {
	$reservation = null;
	$reservation_code = extract_reservation_code($subject);
	if ($reservation_code == null) {
		$reservation_code = extract_reservation_code($body);
	}
	if ($reservation_code) {
        $sql = new MysqliDb(__DB_HOST__, __DB_USER__, __DB_PASS__, __DB_DB__);
		$result = $sql->rawQuery("SELECT * FROM reservations WHERE _code = ?", Array($reservation_code), false);
		if (count($result) > 0) {
			$reservation = $result[0]; // use the first reservation
			$sql->rawQuery("INSERT INTO email_history (_type, _reservation, _to, _subject, _body, _sent) VALUES(?, ?, ?, ?, ?, ?)", Array('incoming', $reservation['_id'], $to, $subject, $body, $date));
			$sql->rawQuery("UPDATE reservations SET _has_emails = TRUE WHERE _id = ?", Array($reservation['_id']));
		}
	}
	return $reservation;
}



$mail = imap_open('{' . __INCOMING_MAIL_SERVER__ . ':' . __INCOMING_MAIL_PORT__ . '/pop3/novalidate-cert}INBOX', __INCOMING_MAIL_USERNAME__, __INCOMING_MAIL_PASSWORD__, OP_SILENT);
$mbox = imap_check($mail); 
for ($n = 1; $n <= $mbox->Nmsgs; $n++) {
	$headers = imap_header($mail, $n);
	$subject = $headers->subject;
	$sender = $headers->sender[0];
	$from = $sender->mailbox . "@" . $sender->host;
	$to = __MAIL_TSTUPKE_EMAIL__;
    $dt = new DateTime('@' . $headers->udate);
    $dt->setTimeZone(new DateTimeZone('Europe/Brussels'));
	$date = $dt->format("Y-m-d H:i:s");

    $now = new DateTime();
    $now->setTimeZone(new DateTimeZone('Europe/Brussels'));

    $body = imap_fetchbody($mail,$n,1.2);
    if (!strlen($body)>0) {
        $body = imap_fetchbody($mail,$n,1);
    }

    $reservation = find_reservation_from_code($subject, $body, $to, $date);
	if ($reservation) {
		printf("[%s] - [inkomende emails] - %s - email ontvangen voor reservatie: '%s' [%s] - de reservatie start op %s\n", $now->format("Y-m-d H:i:s"), $reservation['_type'], $reservation['_code'], $reservation['_entity'], $reservation['_arrival']);
	} else {
		printf("[%s] - [inkomende emails] - ! Email %s genegeerd van %s [%s]. Geen reservatie-code gevonden.\n", $now->format("Y-m-d H:i:s"), $n, $from, $subject);
	}
	
	imap_delete($mail, $n);
}
imap_expunge($mail);
imap_close($mail);
?>