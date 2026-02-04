package br.leetjourney.fincore.api.mapper;

import br.leetjourney.fincore.api.dto.CustomerRequest;
import br.leetjourney.fincore.api.dto.CustomerResponse;
import br.leetjourney.fincore.core.entity.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        builder = @Builder(disableBuilder = true), // Desativa o uso do Builder pelo MapStruct
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerMapper {

    @Mapping(target = "id",ignore = true)
    @Mapping(target = "uuid",ignore = true)
    @Mapping(target = "status",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    Customer toEntity(CustomerRequest request);


    CustomerResponse toResponse(Customer customer);


    @Mapping(target = "id",ignore = true)
    @Mapping(target = "uuid",ignore = true)
    void updateEntityFromRequest(CustomerRequest request, @MappingTarget Customer customer);
}
