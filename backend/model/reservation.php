<?php

class Reservation extends Model {
    protected static $_table_name = 'reservations';

    protected $year;

    protected $_id;

    protected $_entity;

    // Duration
    protected $_arrival;
    protected $_departure;

    // Contact information
    protected $_name;
    protected $_address;
    protected $_email;
    protected $_phone;

    // Status
    protected $_created;
    protected $_email_sent;
    protected $_status;

    function __construct($year = null) {
        parent::__construct();
        $this->year = $year;
    }


    public function find($id)
    {
        if ($id) {
            self::$_db->where('_id', $id);
            return self::$_db->getOne(self::$_table_name);
        } else {
            self::$_db->where('YEAR(_arrival)', $this->year);
            self::$_db->orderBy('_arrival', 'desc');
            return self::$_db->get(self::$_table_name);
        }
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



    private function toData() {
        return array(
            '_id' => $this->_id,
            '_entity' => $this->_entity,
            '_arrival' => $this->_from,
            '_departure' => $this->_until,
            '_name' => $this->_name,
            '_email' => $this->_email,
            '_address' => $this->_address,
            '_phone' => $this->_phone,
            '_created' => $this->_created,
            '_agreed' => $this->_agreed,
            '_email_sent' => $this->_email_sent,
            '_status' => $this->_status,
        );
    }

    public function jsonSerialize() {
        return $this->toData();
    }
}