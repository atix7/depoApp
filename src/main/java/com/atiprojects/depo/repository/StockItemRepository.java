package com.atiprojects.depo.repository;

import com.atiprojects.depo.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, Long> {

    List<StockItem> findByWarehouseId(Long warehouseId);
    List<StockItem> findByProductId(Long productId);
    Optional<StockItem> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
}