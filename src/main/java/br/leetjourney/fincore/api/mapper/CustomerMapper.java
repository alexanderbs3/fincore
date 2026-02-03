package br.leetjourney.fincore.api.mapper;

import br.leetjourney.fincore.api.dto.CustomerRequest;
import br.leetjourney.fincore.api.dto.CustomerResponse;
import br.leetjourney.fincore.core.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id",ignore = true)
    @Mapping(target = "uuid",ignore = true)
    @Mapping(target = "status",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updateAt",ignore = true)
    Customer toEntity(CustomerRequest request);


    CustomerResponse toResponse(Customer customer);


    @Mapping(target = "id",ignore = true)
    @Mapping(target = "uuid",ignore = true)
    void updateEntityFromRequest(CustomerRequest request, @MappingTarget Customer customer);
}
