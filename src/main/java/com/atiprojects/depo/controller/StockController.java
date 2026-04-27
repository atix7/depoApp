package com.atiprojects.depo.controller;

import com.atiprojects.depo.dto.StockItemDTO;
import com.atiprojects.depo.dto.StockMovementDTO;
import com.atiprojects.depo.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<StockItemDTO>> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockService.getByWarehouse(warehouseId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockItemDTO>> getStockByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getStockByProduct(productId));
    }

    @GetMapping("/movements/product/{productId}")
    public ResponseEntity<List<StockMovementDTO>> getMovementsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getMovementsByProduct(productId));
    }

    @GetMapping("/movements/date")
    public ResponseEntity<List<StockMovementDTO>> getMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(stockService.getMovementsByDateRange(from, to));
    }

    @PostMapping("/in")
    public ResponseEntity<StockMovementDTO> stockIn(
            @RequestParam Long productId,
            @RequestParam Long warehouseId,
            @RequestParam Long userId,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(stockService.stockIn(productId, warehouseId, userId, quantity, note));
    }

    @PostMapping("/out")
    public ResponseEntity<StockMovementDTO> stockOut(
            @RequestParam Long productId,
            @RequestParam Long warehouseId,
            @RequestParam Long userId,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(stockService.stockOut(productId, warehouseId, userId, quantity, note));
    }
}