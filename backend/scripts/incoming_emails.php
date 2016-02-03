<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));


function extract_reservation_code($text) {
    $pattern = '/(\d{4}-\d{2}-\d{2}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/';
    preg_match($pattern, $text, $matches);
    return count($matches > 0) ? $matches[0] : null;
}

function find_reservation_from_code($subject, $body, $to, $subject, $date) {
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
            $sql->rawQuery("INSERT INTO email_history (_type, _reservation, _to, _subject, _body, _sent) VALUES(?, ?, ?, ?, ?, ?)", Array('incoming', $reservation['_id'], $to, $subject, substr($body, 0, 1024*32), $date));
            $sql->rawQuery("UPDATE reservations SET _has_emails = TRUE WHERE _id = ?", Array($reservation['_id']));
        }
    }
    return $reservation;
}



function getmsg($mbox,$mid) {
    // input $mbox = IMAP stream, $mid = message id
    // output all the following:
    global $charset,$htmlmsg,$plainmsg,$attachments;
    $htmlmsg = $plainmsg = $charset = '';
    $attachments = array();

    // HEADER
    $h = imap_header($mbox,$mid);
    // add code here to get date, from, to, cc, subject...

    // BODY
    $s = imap_fetchstructure($mbox,$mid);
    if (!$s->parts)  // simple
        getpart($mbox,$mid,$s,0);  // pass 0 as part-number
    else {  // multipart: cycle through each part
        foreach ($s->parts as $partno0=>$p)
            getpart($mbox,$mid,$p,$partno0+1);
    }
}

function getpart($mbox,$mid,$p,$partno) {
    // $partno = '1', '2', '2.1', '2.1.3', etc for multipart, 0 if simple
    global $htmlmsg,$plainmsg,$charset,$attachments;

    // DECODE DATA
    $data = ($partno)?
        imap_fetchbody($mbox,$mid,$partno):  // multipart
        imap_body($mbox,$mid);  // simple
    // Any part may be encoded, even plain text messages, so check everything.
    if ($p->encoding==4)
        $data = quoted_printable_decode($data);
    elseif ($p->encoding==3)
        $data = base64_decode($data);

    // PARAMETERS
    // get all parameters, like charset, filenames of attachments, etc.
    $params = array();
    if ($p->parameters)
        foreach ($p->parameters as $x)
            $params[strtolower($x->attribute)] = $x->value;
    if ($p->dparameters)
        foreach ($p->dparameters as $x)
            $params[strtolower($x->attribute)] = $x->value;

    // ATTACHMENT
    // Any part with a filename is an attachment,
    // so an attached text file (type 0) is not mistaken as the message.
    if ($params['filename'] || $params['name']) {
        // filename may be given as 'Filename' or 'Name' or both
        $filename = ($params['filename'])? $params['filename'] : $params['name'];
        // filename may be encoded, so see imap_mime_header_decode()
        $attachments[$filename] = $data;  // this is a problem if two files have same name
    }

    // TEXT
    if ($p->type==0 && $data) {
        // Messages may be split in different parts because of inline attachments,
        // so append parts together with blank row.
        if (strtolower($p->subtype)=='plain')
            $plainmsg .= trim($data) ."\n\n";
        else
            $htmlmsg .= $data ."<br><br>";
        $charset = $params['charset'];  // assume all parts are same charset
    }

    // EMBEDDED MESSAGE
    // Many bounce notifications embed the original message as type 2,
    // but AOL uses type 1 (multipart), which is not handled here.
    // There are no PHP functions to parse embedded messages,
    // so this just appends the raw source to the main message.
    elseif ($p->type==2 && $data) {
        $plainmsg .= $data."\n\n";
    }

    // SUBPART RECURSION
    if ($p->parts) {
        foreach ($p->parts as $partno0=>$p2)
            getpart($mbox,$mid,$p2,$partno.'.'.($partno0+1));  // 1.2, 1.2.1, etc.
    }
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
    $date = $dt->format("Y-m-d H:m:s");

    getmsg($mail, $n);
    
    $dt = new DateTime();
    $dt->setTimeZone(new DateTimeZone('Europe/Brussels'));

    $reservation = find_reservation_from_code($subject, $htmlmsg ? $htmlmsg : $plainmsg, $to, $subject, $date);
    if ($reservation) {
        printf("[%s] - [inkomende emails] - %s - email ontvangen voor reservatie: '%s' [%s] - de reservatie start op %s\n", date("Y-m-d H:m:s"), $reservation['_type'], $reservation['_code'], $reservation['_entity'], $reservation['_arrival']);
    } else {
        printf("[%s] - [inkomende emails] - ! Email %s genegeerd van %s [%s]. Geen reservatie-code gevonden.\n", $dt->format("Y-m-d H:m:s"), $n, $from, $subject);
    }
    
    imap_delete($mail, $n);
}
imap_expunge($mail);
imap_close($mail);
?>