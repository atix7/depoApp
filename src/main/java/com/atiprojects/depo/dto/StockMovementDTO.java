package com.atiprojects.depo.dto;

import com.atiprojects.depo.entity.MovementType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StockMovementDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long warehouseId;
    private String warehouseName;
    private Long userId;
    private MovementType type;
    private Integer quantity;
    private LocalDateTime createdAt;
    private String note;
}