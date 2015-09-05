<?php

require_once(realpath(dirname(__FILE__) . '/../../config.php'));

header('Content-Type: application/json');

$account = new Account();
$response = '{}';

switch ($_REQUEST['action']) {
    case 'login':
        $body = json_decode(file_get_contents('php://input'));
        $response = $account->login($body->username, $body->password);
        if (!$response['token']) {
            header(':', true, 401);
            echo '{ "error": "authentication failed" }';
            exit;
        }
        break;
    case 'logout':
        $token = $_SERVER['HTTP_X_ACCESS_TOKEN'];
        if ($token) {
            $response = $account->logout($token);
        }
        break;
}


echo json_encode($response);
