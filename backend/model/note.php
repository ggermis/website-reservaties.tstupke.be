<?php

class Note extends Model {
    protected static $_table_name = 'notes';

    protected $reservation_id;

    protected $_id;
    protected $_reservation;
    protected $_note;
    protected $_created;

    function __construct($reservation_id = null) {
        parent::__construct();
        $this->reservation_id =  $reservation_id;
    }


    public function find($id)
    {
        if ($id) {
            self::$_db->where('_id', $id);
            return self::$_db->getOne(self::$_table_name);
        } else {
	        self::$_db->where('_reservation', $this->reservation_id);
	        self::$_db->orderBy('_created', 'asc');
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
            '_reservation' => $this->_reservation,
            '_note' => $this->_note,
            '_created' => $this->_created,
        );
    }

    public function jsonSerialize() {
        return $this->toData();
    }
}