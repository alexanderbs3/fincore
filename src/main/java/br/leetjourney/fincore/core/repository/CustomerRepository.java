package br.leetjourney.fincore.core.repository;

import br.leetjourney.fincore.core.entity.Customer;
import br.leetjourney.fincore.core.entity.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer>findByUuid(String uuid);

    boolean existsByDocumentNumber(String documentNumber);

    boolean existsByEmail(String email);

    Page<Customer> findByAllByStatus(CustomerStatus status, Pageable pageable);

}