package br.leetjourney.fincore.api.controller;

import br.leetjourney.fincore.api.dto.CustomerRequest;
import br.leetjourney.fincore.api.dto.CustomerResponse;
import br.leetjourney.fincore.core.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@RequestBody @Valid CustomerRequest request){
        var response = customerService.create(request);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{uuid}")
                .buildAndExpand(response.uuid())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<CustomerResponse> getByUuid(@PathVariable String uuid){
        return ResponseEntity.ok(customerService.findById(uuid));
    }

    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> listAll(
            @PageableDefault(size = 10, sort = "fullName") Pageable pageable) {
        return ResponseEntity.ok(customerService.findAll(pageable));
    }
}