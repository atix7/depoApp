package com.atiprojects.depo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LowStockProductDTO {
    private Long id;
    private String name;
    private String sku;
    private int quantity;
    private int minStock;
}
