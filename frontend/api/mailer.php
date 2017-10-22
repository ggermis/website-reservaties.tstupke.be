<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));
use PHPMailer\PHPMailer\PHPMailer;

$params = json_decode(file_get_contents('php://input'), true);


class Mailer {

    function __construct($reservation, $template) {
        $this->sql = new MysqliDb(__DB_HOST__, __DB_USER__, __DB_PASS__, __DB_DB__);
        $smarty = new Smarty;
        // $smarty->setCompileDir('/tmp/templates_cc');
        $smarty->assign('reservation', $reservation);
        $this->reservation = $reservation;
        $this->message = $smarty->fetch($template);
        $this->headers = 'MIME-Version: 1.0' . PHP_EOL .
            'Content-Type: text/html; charset=utf-8' . PHP_EOL .
            'From: ' . __MAIL_TSTUPKE__ . PHP_EOL .
            'Reply-To: ' . __MAIL_TSTUPKE__ . PHP_EOL;
    }

    function sendWithoutHistory($to, $subject, $type = "reservation") {
        return $this->sendSMTPEmail($to, $subject, $this->message);
    }

    function send($to, $subject, $type = "reservation") {
        $result = $this->sendSMTPEmail($to, $subject, $this->message);
        if ($result) {
            $dt = new DateTime();
            $dt->setTimeZone(new DateTimeZone('Europe/Brussels'));
            $date = $dt->format("Y-m-d H:i:s");

            $reservation_id = $this->findStoredReservationId();
            $status_query = "UPDATE reservations SET _has_emails = TRUE WHERE _id = ?";
            $this->sql->rawQuery($status_query, Array($reservation_id));
            $audit_query = "INSERT INTO email_history (_type, _reservation, _to, _subject, _body, _sent) VALUES(?, ?, ?, ?, ?, ?)";
            $this->sql->rawQuery($audit_query, Array($type, $reservation_id, $to, $subject, $this->message, $date)); 
        }
        return $result;
    }

    function findStoredReservationId() {
        $query = "SELECT _id FROM reservations WHERE _arrival = ? AND _departure = ? AND _entity = ? AND _email = ? LIMIT 1";
        $result = $this->sql->rawQuery($query, Array($this->reservation['_arrival'], $this->reservation['_departure'], $this->reservation['_entity'], $this->reservation['_email']));
        file_put_contents('/tmp/test.txt', $result[0]['_id']);
        return $result[0]['_id'];
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


$reservation = $params['message'];



$template = __FRONTEND_DIR__ . '/api/mail-templates/internal/reservation.tpl';
$mailer = new Mailer($reservation, $template);
$mailer->sendWithoutHistory(__MAIL_TSTUPKE_EMAIL__, "Reservatie: " . $reservation['_entity'] . ' (' . $reservation['_name'] . ')');

$template = realpath(dirname(__FILE__)) . '/mail-templates/' . $reservation['_type'] . '/reservation.tpl';
$mailer = new Mailer($reservation, $template);


if ($mailer->send($reservation['_email'], "Bevestiging reservatie " . $reservation['_code'])) {
    echo json_encode(array("status" => "ok"));
} else {
    header(':', true, 501);
    echo json_encode(array("status" => "error"));;
}
