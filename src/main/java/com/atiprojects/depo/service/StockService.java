package com.atiprojects.depo.service;

import com.atiprojects.depo.entity.*;
import com.atiprojects.depo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    public List<StockItem> getStockByWarehouse(Long warehouseId) {
        return stockItemRepository.findByWarehouseId(warehouseId);
    }

    public List<StockItem> getStockByProduct(Long productId) {
        return stockItemRepository.findByProductId(productId);
    }

    public List<StockMovement> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductId(productId);
    }

    public List<StockMovement> getMovementsByDateRange(LocalDateTime from, LocalDateTime to) {
        return stockMovementRepository.findByCreatedAtBetween(from, to);
    }

    @Transactional
    public StockMovement stockIn(Long productId, Long warehouseId, Long userId, Integer quantity, String note) {
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

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setWarehouse(warehouse);
        movement.setUser(user);
        movement.setType(MovementType.IN);
        movement.setQuantity(quantity);
        movement.setCreatedAt(LocalDateTime.now());
        movement.setNote(note);

        return stockMovementRepository.save(movement);
    }

    @Transactional
    public StockMovement stockOut(Long productId, Long warehouseId, Long userId, Integer quantity, String note) {
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

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setWarehouse(warehouse);
        movement.setUser(user);
        movement.setType(MovementType.OUT);
        movement.setQuantity(quantity);
        movement.setCreatedAt(LocalDateTime.now());
        movement.setNote(note);

        return stockMovementRepository.save(movement);
    }
}