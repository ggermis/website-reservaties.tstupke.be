<?php

abstract class Model {
    protected static $_db;

    function __construct() {
        self::$_db = new MysqliDb(__DB_HOST__, __DB_USER__, __DB_PASS__, __DB_DB__);
    }

    abstract public function find($id);
    abstract public function create($data);
    abstract public function update($id, $data);
    abstract public function delete($id);
}