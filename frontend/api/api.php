<?php

require_once(realpath( dirname(__FILE__) . '/../../config.php'));

header('Content-Type: application/json');

// Authorization

$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method == 'PUT' || $request_method == 'DELETE') { // bypass for read / create
    $token = $_SERVER['HTTP_X_ACCESS_TOKEN'];
    if (!$token) {
        header(':', true, 401);
        echo '{ "error": "unauthorized" }';
        exit;
    }

    $account = new Account();
    if ($account->find_by_token($token) == null) {
        header(':', true, 401);
        echo '{ "error": "unauthorized" }';
        exit;
    }
}

// Model interaction

$id = $_REQUEST['id'];
$model_name = $_REQUEST['model'];
$model_path = __ROOT__ . "/backend/model/{$model_name}.php";
if (!file_exists($model_path)) {
    header(':', true, 400);
    exit;
}

require_once($model_path);
$model = null;

switch($model_name) {
    case 'reservation':
        $model = new Reservation();
        break;
    default:
        header(':', true, 400);
        echo '{ "error": "not yet implemented!" }';
        exit;
}

$response = '{}';

function ensure_variable_set($variable) {
    if (!$variable) {
        header(':', true, 400);
        echo '{ "error": "no id set" }';
        exit;
    }
}

$action = $_REQUEST['action'];

switch($request_method) {
    case 'GET':
        $response = $model->find($id);
        break;
    case 'POST':
        $response = $model->create(json_decode(file_get_contents('php://input')));
        break;
    case 'PUT':
        ensure_variable_set($id);
        $response = $model->update($id, json_decode(file_get_contents('php://input')));
        break;
    case 'DELETE':
        ensure_variable_set($id);
        $response = $model->delete($id);
        break;
}

echo json_encode($response);
