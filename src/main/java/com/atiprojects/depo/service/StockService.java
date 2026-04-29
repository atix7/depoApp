package com.atiprojects.depo.service;

import com.atiprojects.depo.dto.StockItemDTO;
import com.atiprojects.depo.dto.StockMovementDTO;
import com.atiprojects.depo.entity.*;
import com.atiprojects.depo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    private StockItemDTO toDTO(StockItem item) {
        StockItemDTO dto = new StockItemDTO();
        dto.setId(item.getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductSku(item.getProduct().getSku());
        dto.setQuantity(item.getQuantity());
        dto.setWarehouseId(item.getWarehouse().getId());
        dto.setWarehouseName(item.getWarehouse().getName());
        return dto;
    }

    // A listázó metódus már DTO-t ad vissza
    public List<StockItemDTO> getByWarehouse(Long warehouseId) {
        List<StockItem> items = stockItemRepository.findByWarehouseId(warehouseId);
        return items.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StockItemDTO> getStockByWarehouse(Long warehouseId) {
        return stockItemRepository.findByWarehouseId(warehouseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StockItemDTO> getStockByProduct(Long productId) {
        return stockItemRepository.findByProductId(productId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StockMovementDTO> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductId(productId).stream()
                .map(this::toMovementDTO)
                .collect(Collectors.toList());
    }

    public List<StockMovementDTO> getMovementsByDateRange(LocalDateTime from, LocalDateTime to) {
        return stockMovementRepository.findByCreatedAtBetween(from, to).stream()
                .map(this::toMovementDTO)
                .collect(Collectors.toList());
    }

    private StockMovementDTO toMovementDTO(StockMovement m) {
        StockMovementDTO dto = new StockMovementDTO();
        dto.setId(m.getId());
        dto.setProductId(m.getProduct().getId());
        dto.setProductName(m.getProduct().getName());
        dto.setWarehouseId(m.getWarehouse().getId());
        dto.setWarehouseName(m.getWarehouse().getName());
        dto.setUserId(m.getUser().getId());
        dto.setType(m.getType());
        dto.setQuantity(m.getQuantity());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setNote(m.getNote());
        return dto;
    }

    @Transactional
    public StockMovementDTO stockIn(Long productId, Long warehouseId, Long userId, Integer quantity, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found: " + warehouseId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        StockItem stockItem = stockItemRepository
                .findByProductIdAndWarehouseId(productId, warehouseId)
                .orElse(new StockItem());

        stockItem.setProduct(product);
        stockItem.setWarehouse(warehouse);
        stockItem.setQuantity(stockItem.getQuantity() == null ? quantity : stockItem.getQuantity() + quantity);
        stockItemRepository.save(stockItem);

        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setWarehouse(warehouse);
        movement.setUser(user);
        movement.setType(MovementType.IN);
        movement.setQuantity(quantity);
        movement.setCreatedAt(LocalDateTime.now());
        movement.setNote(note);

        return toMovementDTO(stockMovementRepository.save(movement));
    }

    @Transactional
    public StockMovementDTO stockOut(Long productId, Long warehouseId, Long userId, Integer quantity, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found: " + warehouseId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        StockItem stockItem = stockItemRepository
                .findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Stock not found for this product and warehouse"));

        if (stockItem.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock! Available: " + stockItem.getQuantity());
        }

        stockItem.setQuantity(stockItem.getQuantity() - quantity);
        stockItemRepository.save(stockItem);

        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setWarehouse(warehouse);
        movement.setUser(user);
        movement.setType(MovementType.OUT);
        movement.setQuantity(quantity);
        movement.setCreatedAt(LocalDateTime.now());
        movement.setNote(note);

        return toMovementDTO(stockMovementRepository.save(movement));
    }
}