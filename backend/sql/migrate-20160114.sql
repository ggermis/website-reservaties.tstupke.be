ALTER TABLE reservations ADD (
  _has_emails BOOLEAN DEFAULT FALSE,
  _has_notes BOOLEAN DEFAULT FALSE,
  _code VARCHAR(50),
  _deleted BOOLEAN DEFAULT FALSE,
);

ALTER TABLE `codenuto_reservaties`.`reservations` 
  ADD INDEX `deleted` USING BTREE (`_deleted` ASC) ;