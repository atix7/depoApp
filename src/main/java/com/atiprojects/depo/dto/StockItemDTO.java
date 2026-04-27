package com.atiprojects.depo.dto;

import lombok.Data;

@Data
public class StockItemDTO {
    private Long id;
    private String productName;
    private String productSku;
    private Integer quantity;
    private Long warehouseId;
    private String warehouseName;
}