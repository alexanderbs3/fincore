CREATE TABLE financial_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    source_account_id BIGINT,
    destination_account_id BIGINT NOT NULL,
    amount DECIMAL(19,2) NOT NULL, -- GARANTA QUE O NOME SEJA 'amount'
    type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_source FOREIGN KEY (source_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_tx_dest FOREIGN KEY (destination_account_id) REFERENCES accounts(id)
);