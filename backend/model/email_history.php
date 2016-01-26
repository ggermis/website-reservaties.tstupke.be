<?php

class EmailHistory extends Model {
    protected static $_table_name = 'email_history';

    protected $_id;
    protected $_reservation;
    protected $_to;
    protected $_subject;
    protected $_type;
    protected $_sent;
    protected $_body;

    function __construct() {
        parent::__construct();
    }


    public function find($reservation_id)
    {
        self::$_db->where('_reservation', $reservation_id);
        self::$_db->orderBy('_sent', 'desc');
        return self::$_db->get(self::$_table_name);
    }

    public function create($data) {}
    public function update($id, $data) {}
    public function delete($id) {}


    private function toData() {
        return array(
            '_id' => $this->_id,
            '_reservation' => $this->_reservation,
            '_to' => $this->_to,
            '_subject' => $this->_subject,
            '_type' => $this->_type,
            '_sent' => $this->_sent,
            '_body' => $this->_body,
        );
    }

    public function jsonSerialize() {
        return $this->toData();
    }
}