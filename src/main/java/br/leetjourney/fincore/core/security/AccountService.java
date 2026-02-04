package br.leetjourney.fincore.core.security;

import br.leetjourney.fincore.api.dto.request.AccountRequest;
import br.leetjourney.fincore.api.dto.response.AccountResponse;
import br.leetjourney.fincore.core.entity.Account;
import br.leetjourney.fincore.core.repository.AccountRepository;
import br.leetjourney.fincore.core.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;


    public AccountResponse create(AccountRequest request) {
        var customer = customerRepository.findByUuid(request.customerUuid())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado para UUID encontrado"));


        String accountNumber = generateUniqueAccountNumber();

        var account = Account.builder()
                .accountNumber(accountNumber)
                .agency("0001")
                .balance(BigDecimal.ZERO)
                .type(request.type())
                .customer(customer)
                .build();

        var savedAccount = accountRepository.save(account);
        return toResponse(savedAccount);
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            number = String.valueOf((int) (Math.random() * 900000) + 100000);
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }


    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getUuid(),
                account.getAccountNumber(),
                account.getAgency(),
                account.getBalance(),
                account.getType()
        );
    }

}
