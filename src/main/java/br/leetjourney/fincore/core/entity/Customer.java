package br.leetjourney.fincore.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Column(name = "fullName", nullable = false, length = 150)
    private String fullName;

    @Column(name = "document_number",nullable = false,unique = true,length = 14)
    private String documentNumber;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 20)
    private CustomerStatus status;




}
