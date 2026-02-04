package br.leetjourney.fincore.core.service;

import br.leetjourney.fincore.api.dto.request.CustomerRequest;
import br.leetjourney.fincore.api.dto.response.CustomerResponse;
import br.leetjourney.fincore.api.exception.BusinessException;
import br.leetjourney.fincore.api.mapper.CustomerMapper;
import br.leetjourney.fincore.core.entity.CustomerStatus;
import br.leetjourney.fincore.core.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;


    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        validateUniqueness(request);

        var customer = customerMapper.toEntity(request);

        customer.setStatus(CustomerStatus.ACTIVE);

        var savedCustomer = customerRepository.save(customer);

        return customerMapper.toResponse(savedCustomer);

    }

    public CustomerResponse findById(String uuid){
        return customerRepository.findByUuid(uuid)
                .map(customerMapper::toResponse)
                .orElseThrow(() -> new BusinessException("Cliente não encontrado com o UUID informado"));
    }


    public Page<CustomerResponse> findAll(Pageable pageable){
        return customerRepository.findAll(pageable).map(customerMapper::toResponse);
    }

    private void validateUniqueness(CustomerRequest request){
        if (customerRepository.existsByDocumentNumber(request.documentNumber())){
            throw new BusinessException("Já existe um cliente com o documento informado");

        }

        if (customerRepository.existsByEmail(request.email())){
            throw new BusinessException("Já existe um cliente com o email informado");
        }
    }
}
