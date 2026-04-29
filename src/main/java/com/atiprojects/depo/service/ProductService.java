package com.atiprojects.depo.service;

import com.atiprojects.depo.dto.LowStockProductDTO;
import com.atiprojects.depo.entity.Category;
import com.atiprojects.depo.entity.Product;
import com.atiprojects.depo.entity.StockItem;
import com.atiprojects.depo.repository.CategoryRepository;
import com.atiprojects.depo.repository.ProductRepository;
import com.atiprojects.depo.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockItemRepository stockItemRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategory_Id(categoryId);
    }

    public List<LowStockProductDTO> getLowStockProducts() {
        return productRepository.findAll().stream()
                .map(p -> {
                    int total = stockItemRepository.findByProductId(p.getId())
                            .stream()
                            .mapToInt(StockItem::getQuantity)
                            .sum();
                    return new LowStockProductDTO(p.getId(), p.getName(), p.getSku(), total, p.getMinStock());
                })
                .filter(dto -> dto.getQuantity() <= dto.getMinStock())
                .toList();
    }

    public Product createProduct(Product product) {
        Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setSku(updated.getSku());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setMinStock(updated.getMinStock());
        existing.setCategory(updated.getCategory());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}