package com.auction.service;

import com.auction.dto.ProductDto;
import com.auction.entity.*;
import com.auction.entity.Product.AuctionStatus;
import com.auction.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final FileUploadService fileUploadService;

    /**
     * 상품 등록 (이미지 포함)
     */
    @Transactional
    public ProductDto.Detail createProduct(Long sellerId,
                                           ProductDto.CreateRequest request,
                                           List<MultipartFile> images) throws IOException {
        Member seller = memberRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다"));

        // 즉시구매가 검증
        if (request.getBuyNowPrice() != null && request.getBuyNowPrice() <= request.getStartPrice()) {
            throw new IllegalArgumentException("즉시구매가는 시작가보다 높아야 합니다");
        }

        // 상품 생성
        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .itemCondition(Product.ItemCondition.valueOf(request.getItemCondition()))
                .startPrice(request.getStartPrice())
                .currentPrice(request.getStartPrice())
                .buyNowPrice(request.getBuyNowPrice())
                .deliveryType(Product.DeliveryType.valueOf(request.getDeliveryType()))
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusDays(request.getAuctionDays()))
                .status(AuctionStatus.ACTIVE)
                .build();

        product = productRepository.save(product);

        // 이미지 업로드 및 저장
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = fileUploadService.uploadFiles(images, "products");
            for (int i = 0; i < imageUrls.size(); i++) {
                ProductImage image = ProductImage.builder()
                        .imageUrl(imageUrls.get(i))
                        .imageOrder(i)
                        .isThumbnail(i == 0) // 첫 번째 이미지가 썸네일
                        .build();
                product.addImage(image);
            }
            productRepository.save(product);
        }

        return toDetail(product);
    }

    /**
     * 상품 상세 조회 (조회수 증가)
     */
    @Transactional
    public ProductDto.Detail getProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        product.setViewCount(product.getViewCount() + 1);

        return toDetail(product);
    }

    /**
     * 경매중 상품 목록 (페이징 + 정렬)
     */
    public ProductDto.PageResponse getActiveProducts(int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Product> productPage = productRepository.findByStatus(AuctionStatus.ACTIVE, pageable);
        return toPageResponse(productPage);
    }

    /**
     * 카테고리별 상품 목록 (대분류 클릭 시 하위 카테고리 포함)
     */
    public ProductDto.PageResponse getProductsByCategory(Long categoryId, int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Product> productPage = productRepository
                .findByStatusAndCategoryOrParent(AuctionStatus.ACTIVE, categoryId, pageable);
        return toPageResponse(productPage);
    }

    /**
     * 제목 검색
     */
    public ProductDto.PageResponse searchProducts(String keyword, int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Product> productPage = productRepository
                .searchByTitle(AuctionStatus.ACTIVE, keyword, pageable);
        return toPageResponse(productPage);
    }

    /**
     * 내 판매 상품 목록
     */
    public ProductDto.PageResponse getMyProducts(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findBySellerId(sellerId, pageable);
        return toPageResponse(productPage);
    }

    /**
     * 상품 수정 (판매자 본인만, 입찰 없을 때만)
     */
    @Transactional
    public ProductDto.Detail updateProduct(Long productId, Long memberId,
                                           ProductDto.UpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        if (!product.getSeller().getId().equals(memberId)) {
            throw new SecurityException("본인의 상품만 수정할 수 있습니다");
        }

        if (product.getBidCount() > 0) {
            throw new IllegalArgumentException("입찰이 있는 상품은 수정할 수 없습니다");
        }

        if (request.getTitle() != null) product.setTitle(request.getTitle());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getItemCondition() != null)
            product.setItemCondition(Product.ItemCondition.valueOf(request.getItemCondition()));
        if (request.getBuyNowPrice() != null) product.setBuyNowPrice(request.getBuyNowPrice());
        if (request.getDeliveryType() != null)
            product.setDeliveryType(Product.DeliveryType.valueOf(request.getDeliveryType()));

        return toDetail(product);
    }

    /**
     * 상품 삭제 (판매자 본인만, 입찰 없을 때만)
     */
    @Transactional
    public void deleteProduct(Long productId, Long memberId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        if (!product.getSeller().getId().equals(memberId)) {
            throw new SecurityException("본인의 상품만 삭제할 수 있습니다");
        }

        if (product.getBidCount() > 0) {
            throw new IllegalArgumentException("입찰이 있는 상품은 삭제할 수 없습니다");
        }

        // 이미지 파일 삭제
        for (ProductImage img : product.getImages()) {
            fileUploadService.deleteFile(img.getImageUrl());
        }

        product.setStatus(AuctionStatus.CANCELLED);
    }

    /**
     * 현재가 조회 (Polling용 — 가벼운 조회)
     */
    public ProductDto.ListItem getCurrentPrice(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다"));

        return ProductDto.ListItem.builder()
                .id(product.getId())
                .currentPrice(product.getCurrentPrice())
                .bidCount(product.getBidCount())
                .status(product.getStatus().name())
                .build();
    }

    // ============ Private Helpers ============

    private Pageable createPageable(int page, int size, String sort) {
        Sort sortObj = switch (sort != null ? sort : "latest") {
            case "price_asc" -> Sort.by("currentPrice").ascending();
            case "price_desc" -> Sort.by("currentPrice").descending();
            case "ending_soon" -> Sort.by("endTime").ascending();
            case "popular" -> Sort.by("bidCount").descending();
            default -> Sort.by("createdAt").descending();
        };
        return PageRequest.of(page, size, sortObj);
    }

    private ProductDto.PageResponse toPageResponse(Page<Product> page) {
        List<ProductDto.ListItem> items = page.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        return ProductDto.PageResponse.builder()
                .products(items)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    private ProductDto.ListItem toListItem(Product product) {
        String thumbnailUrl = product.getImages().stream()
                .filter(ProductImage::getIsThumbnail)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(null);

        String categoryName = product.getCategory() != null
                ? product.getCategory().getName() : "";

        return ProductDto.ListItem.builder()
                .id(product.getId())
                .title(product.getTitle())
                .thumbnailUrl(thumbnailUrl)
                .itemCondition(product.getItemCondition().name())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .bidCount(product.getBidCount())
                .status(product.getStatus().name())
                .endTime(product.getEndTime().toString())
                .sellerNickname(product.getSeller().getNickname())
                .categoryName(categoryName)
                .viewCount(product.getViewCount())
                .build();
    }

    private ProductDto.Detail toDetail(Product product) {
        List<ProductDto.ImageInfo> images = product.getImages().stream()
                .map(img -> ProductDto.ImageInfo.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .imageOrder(img.getImageOrder())
                        .isThumbnail(img.getIsThumbnail())
                        .build())
                .collect(Collectors.toList());

        Category cat = product.getCategory();
        Category parentCat = cat != null ? cat.getParent() : null;

        return ProductDto.Detail.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .itemCondition(product.getItemCondition().name())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .bidCount(product.getBidCount())
                .status(product.getStatus().name())
                .deliveryType(product.getDeliveryType().name())
                .startTime(product.getStartTime().toString())
                .endTime(product.getEndTime().toString())
                .viewCount(product.getViewCount())
                .sellerId(product.getSeller().getId())
                .sellerNickname(product.getSeller().getNickname())
                .sellerProfileImage(product.getSeller().getProfileImage())
                .topBidderId(product.getTopBidder() != null ? product.getTopBidder().getId() : null)
                .topBidderNickname(product.getTopBidder() != null ? product.getTopBidder().getNickname() : null)
                .categoryId(cat != null ? cat.getId() : null)
                .categoryName(cat != null ? cat.getName() : null)
                .parentCategoryId(parentCat != null ? parentCat.getId() : null)
                .parentCategoryName(parentCat != null ? parentCat.getName() : null)
                .images(images)
                .build();
    }
}
