<?php

require_once(realpath(dirname(__FILE__) . '/../config.php'));

use PHPMailer\PHPMailer\PHPMailer;

class Mailer {
	function send($to, $subject, $message) {
		return $this->sendSMTPEmail($to, $subject, $message);
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

    function getErrorMessage() {
    	return $this->error;
    }
}

$mailer = new Mailer;
$result = $mailer->send('gerrit.germis@gmail.com', 'test subject', 'test message');
print_r($result);
print_r($mailer->getErrorMessage());

?>