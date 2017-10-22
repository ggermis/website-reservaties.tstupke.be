<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));
use PHPMailer\PHPMailer\PHPMailer;

//
// Usage:
//    scheduled_emails.php {type} {days_before} {status} {reservation_type}
// 
//      type . . . . . . . . : Type of mail to send. Should be one of 'reminder', 'instruction', 'arrival'
//      days_before  . . . . : How many days before the _arrival date to send the email
//      status . . . . . . . : Which status should the reservation have? One of 'closed', 'pending', 'confirmed'
//      reservation_type . . : Type of reservations this email applies to. Should be one of 'weekend', 'bivak'
//
// Example:
//
//    Send reminder mail 16 days after registrationo (still pending)
//    $ php frontend/api/scheduled_emails.php reminder 16 pending weekend
//
//    Send instruction mail 2 months before arriving
//    $ php frontend/api/scheduled_emails.php instruction 62 confirmed weekend
//
//    Send arrival mail 1 week before arriving
//    $ php frontend/api/scheduled_emails.php arrival 7 confirmed weekend
//
//
//    Send reminder mail 16 days after registrationo (still pending)
//    $ php frontend/api/scheduled_emails.php reminder 16 pending bivak
//
//    Send instruction mail 2 months before arriving
//    $ php frontend/api/scheduled_emails.php instruction 62 confirmed bivak
//
//
$type = $argv[1];
$days_before = $argv[2];
$status = $argv[3];
$reservation_type = $argv[4];


$sql = new MysqliDb(__DB_HOST__, __DB_USER__, __DB_PASS__, __DB_DB__);

$default_query =  <<<EOT
    SELECT r.* 
      FROM reservations r
     WHERE r._arrival >= NOW() 
       AND DATEDIFF(r._arrival, NOW()) <= ?
       AND r._status = ? 
       AND r._deleted IS FALSE
       AND r._type = ?
       AND r._id NOT IN (
         SELECT h._reservation
           FROM email_history h
          WHERE h._reservation = r._id
            AND h._type = ?
        )
     ORDER BY r._arrival
EOT;


$reminder_query = <<<EOT
    SELECT r.*
      FROM reservations r      
     WHERE r._arrival >= NOW()
       AND DATEDIFF(NOW(), r._created) > ?
       AND r._status = ?
       AND r._deleted IS FALSE
       AND r._type = ?
       AND r._id NOT IN (
        SELECT h._reservation
          FROM email_history h
         WHERE h._reservation = r._id
           AND h._type = ?
        )
     ORDER BY r._arrival;
EOT;


class Mailer {
    function __construct($reservation, $template) {
        $smarty = new Smarty;
        $smarty->assign('reservation', $reservation);
        $this->reservation = $reservation;
        $this->message = $smarty->fetch($template);
        $this->headers = 'MIME-Version: 1.0' . PHP_EOL .
            'Content-Type: text/html; charset=utf-8' . PHP_EOL .
            'From: ' . __MAIL_TSTUPKE__ . PHP_EOL .
            'Reply-To: ' . __MAIL_TSTUPKE__ . PHP_EOL;
    }

    function send($to, $subject, $type = "reservation") {
      if ($this->sendSMTPEmail($to, $subject, $this->message)) {
      // if (mail($to, $subject, $this->message, $this->headers)) {
          $dt = new DateTime();
          $dt->setTimeZone(new DateTimeZone('Europe/Brussels'));
          $date = $dt->format("Y-m-d H:i:s");

          $audit_query = "INSERT INTO email_history (_type, _reservation, _to, _subject, _body, _sent) VALUES(?, ?, ?, ?, ?, ?)";
          $sql = new MysqliDb(__DB_HOST__, __DB_USER__, __DB_PASS__, __DB_DB__);
          $sql->rawQuery($audit_query, Array($type, $this->reservation['_id'], $to, $subject, $this->message, $date)); 
          $status_query = "UPDATE reservations SET _has_emails = TRUE WHERE _id = ?";
          $sql->rawQuery($status_query, Array($this->reservation['_id']));
      }
    }

    function sendSMTPEmail($to, $subject, $message) {
        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->SMTPDebug = 2;
        $mail->Debugoutput = 'html';
        $mail->Host = "localhost";
        $mail->Port = 25;
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;
        $mail->SMTPAuth = true;
        $mail->Username = __INCOMING_MAIL_USERNAME__;
        $mail->Password = __INCOMING_MAIL_PASSWORD__;
        $mail->setFrom(__INCOMING_MAIL_USERNAME__, __MAIL_TSTUPLE_FROM__);
        $mail->addAddress($to, $this->reservation['_name']);
        $mail->addReplyTo(__MAIL_TSTUPKE_EMAIL__, __MAIL_TSTUPLE_FROM__);
        $mail->Subject = $subject;
        $mail->msgHTML($message);
        $mail->SMTPDebug = 0;
        if (!$mail->send()) {
            $this->error = $mail->ErrorInfo;
            return false;
        }
        return true;
    }
}

if ($type == 'reminder') {
    $result = $sql->rawQuery($reminder_query, Array($days_before, $status, $reservation_type, $type), false);
} else {
    $result = $sql->rawQuery($default_query, Array($days_before, $status, $reservation_type, $type), false);
}

for ($i=0; $i<count($result); ++$i) {
    $reservation = $result[$i];   
    $template = __FRONTEND_DIR__ . '/api/mail-templates/' . $reservation['_type'] . '/' . $type . '.tpl';
 
    $dt = new DateTime();
    $dt->setTimeZone(new DateTimeZone('Europe/Brussels'));

    $mailer = new Mailer($reservation, $template);
    $mailer->send($reservation['_email'], "Herinnering reservatie Kampplaats 't Stupke", $type);    
    printf("[%s] - [uitgaande emails] - %s - %s email verstuurd naar: %s [%s] - de reservatie start op %s\n", $dt->format("Y-m-d H:i:s"), $reservation_type, $type, $reservation['_email'], $reservation['_entity'], $reservation['_arrival']);
}


?>