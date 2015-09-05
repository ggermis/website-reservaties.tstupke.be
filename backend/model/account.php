<?php

class Account extends Model
{
    protected static $_table_name = 'accounts';

    protected $_id;

    protected $_name;
    protected $_password;
    protected $_email;

    protected $_role;
    protected $_token;

    protected $_created;
    protected $_active;


    function __construct() {
        parent::__construct();
    }

    public function find($id)
    {
        self::$_db->where('_id', $id);
        return self::$_db->getOne(self::$_table_name);
    }

    public function create($data)
    {
        if ($insert_id = self::$_db->insert(self::$_table_name, get_object_vars($data))) {
            return $this->find($insert_id);
        };
        http_response_code(500);
        return array('error' => self::$_db->getLastError());
    }

    public function update($id, $data)
    {
        self::$_db->where('_id', $id);
        if (self::$_db->update(self::$_table_name, get_object_vars($data))) {
            return $this->find($id);
        }
        http_response_code(500);
        return array('error' => 'update failed');
    }

    public function delete($id)
    {
        self::$_db->where('_id', $id);
        if (self::$_db->delete(self::$_table_name)) {
            return array('status' => 'ok');
        }
        http_response_code(500);
        return array('status' => 'error');
    }


    // Custom methods

    public function find_by_token($token)
    {
        self::$_db->where('_token', $token);
        return self::$_db->getOne(self::$_table_name);
    }

    public function find_by_name($name)
    {
        self::$_db->where('_name', $name);
        return self::$_db->getOne(self::$_table_name);
    }

    public function login($name, $password)
    {
        $user = $this->find_by_name($name);
        if ($user && $user['_password'] === $password) {
            $user['_token'] = uniqid('', true);
            $this->update($user['_id'], (object)$user);
            return array('token' => $user['_token']);
        }
        return array('token' => null);
    }

    public function logout($token) {
        $user = $this->find_by_token($token);
        $user['_token'] = null;
        $this->update($user['_id'], (object)$user);
        return array('token' => null);
    }



    private function toData() {
        return array(
            '_id' => $this->_id,
            '_name' => $this->_name,
            '_password' => $this->_password,
            '_email' => $this->_email,
            '_role' => $this->_role,
            '_token' => $this->_token,
            '_created' => $this->_created,
            '_active' => $this->_active,
        );
    }

    public function jsonSerialize() {
        return $this->toData();
    }

}