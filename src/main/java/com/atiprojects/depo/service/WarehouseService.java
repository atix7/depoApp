package com.atiprojects.depo.service;

import com.atiprojects.depo.dto.WarehouseDTO;
import com.atiprojects.depo.entity.Warehouse;
import com.atiprojects.depo.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    private WarehouseDTO toDTO(Warehouse warehouse) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setLocation(warehouse.getLocation());
        dto.setTotalItems(
                warehouse.getStockItems() == null ? 0 : warehouse.getStockItems().size()
        );
        return dto;
    }

    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found: " + id));
        return toDTO(warehouse);
    }

    public WarehouseDTO createWarehouse(WarehouseDTO dto) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(dto.getName());
        warehouse.setLocation(dto.getLocation());
        return toDTO(warehouseRepository.save(warehouse));
    }

    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO dto) {
        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found: " + id));
        existing.setName(dto.getName());
        existing.setLocation(dto.getLocation());
        return toDTO(warehouseRepository.save(existing));
    }

    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }
}