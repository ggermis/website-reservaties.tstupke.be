<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));

$params = json_decode(file_get_contents('php://input'), true);


class Mailer {
    function __construct($template, $reservation) {
        $smarty = new Smarty;
        $smarty->assign('reservation', $reservation);
        $this->message = $smarty->fetch($template);
        $this->headers = 'MIME-Version: 1.0' . PHP_EOL .
            'Content-Type: text/html; charset=utf-8' . PHP_EOL .
            'From: Kampplaats \'t Stupke <kampplaats@tstupke.be>' . PHP_EOL .
            'Reply-To: Kampplaats \'t Stupke <kampplaats@tstupke.be>' . PHP_EOL;
    }

    function send($to, $subject) {
        return mail($to, $subject, $this->message, $this->headers);
    }
}

$reservation = $params['message'];


$mailer = new Mailer('reservation-internal.tpl', $reservation);
$mailer->send('kampplaats@tstupke.be', "Reservatie: " . $reservation['_entity'] . ' (' . $reservation['_name'] . ')');

$mailer = new Mailer('reservation-public.tpl', $reservation);
if ($mailer->send($reservation['_email'], "Bevestiging reservatie")) {
    echo json_encode(array("status" => "ok"));
} else {
    header(':', true, 500);
    echo json_encode(array("status" => "error"));;
}
