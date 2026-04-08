import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts, setFilters, clearFilters } from '../store/productSlice';
import { fetchCategories } from '../store/categorySlice';
import ProductCard from '../components/product/ProductCard';
import { Container, Button, Input, SectionTitle } from '../styles/CommonStyles';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

function ProductListPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading, totalPages, currentPage, totalElements, hasNext } =
    useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { filters } = useSelector((state) => state.product);

  const [searchInput, setSearchInput] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // URL 파라미터에서 초기 필터 읽기
  useEffect(() => {
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    if (category) dispatch(setFilters({ category: Number(category) }));
    if (keyword) {
      dispatch(setFilters({ keyword }));
      setSearchInput(keyword);
    }
  }, []);

  // 카테고리 로드
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // 필터 변경 시 상품 목록 조회
  useEffect(() => {
    dispatch(fetchProducts({
      page: 0,
      size: 12,
      sort: filters.sort,
      category: filters.category,
      keyword: filters.keyword,
    }));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ keyword: searchInput, category: null }));
    setSearchParams(searchInput ? { keyword: searchInput } : {});
  };

  const handleCategoryClick = (catId) => {
    const newCat = filters.category === catId ? null : catId;
    dispatch(setFilters({ category: newCat, keyword: '' }));
    setSearchInput('');
    setSearchParams(newCat ? { category: newCat } : {});
  };

  const handleSortChange = (sort) => {
    dispatch(setFilters({ sort }));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
    setSearchInput('');
    setSearchParams({});
  };

  const handleLoadMore = () => {
    dispatch(fetchProducts({
      page: currentPage + 1,
      size: 12,
      sort: filters.sort,
      category: filters.category,
      keyword: filters.keyword,
    }));
  };

  const hasActiveFilter = filters.category || filters.keyword;

  return (
    <PageWrapper>
      <Container>
        {/* 상단: 타이틀 + 검색 */}
        <TopSection>
          <div>
            <SectionTitle>경매 상품</SectionTitle>
            <TotalCount>총 {totalElements}개의 상품</TotalCount>
          </div>

          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              placeholder="상품명으로 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <SearchBtn type="submit"><FiSearch size={18} /></SearchBtn>
          </SearchForm>
        </TopSection>

        {/* 필터 토글 (모바일) */}
        <FilterToggle onClick={() => setShowFilter(!showFilter)}>
          <FiFilter size={16} /> 필터
        </FilterToggle>

        {/* 카테고리 필터 */}
        <FilterSection $show={showFilter}>
          <CategoryList>
            <CategoryChip
              $active={!filters.category}
              onClick={handleClearAll}
            >
              전체
            </CategoryChip>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                $active={filters.category === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </CategoryChip>
            ))}
          </CategoryList>

          {/* 정렬 */}
          <SortRow>
            {[
              { key: 'latest', label: '최신순' },
              { key: 'ending_soon', label: '마감임박' },
              { key: 'popular', label: '인기순' },
              { key: 'price_asc', label: '낮은가격' },
              { key: 'price_desc', label: '높은가격' },
            ].map(({ key, label }) => (
              <SortChip
                key={key}
                $active={filters.sort === key}
                onClick={() => handleSortChange(key)}
              >
                {label}
              </SortChip>
            ))}
          </SortRow>
        </FilterSection>

        {/* 활성 필터 표시 */}
        {hasActiveFilter && (
          <ActiveFilters>
            {filters.keyword && (
              <ActiveTag>
                검색: {filters.keyword}
                <FiX size={14} onClick={() => { dispatch(setFilters({ keyword: '' })); setSearchInput(''); }} />
              </ActiveTag>
            )}
            {filters.category && (
              <ActiveTag>
                카테고리: {categories.find(c => c.id === filters.category)?.name}
                <FiX size={14} onClick={() => dispatch(setFilters({ category: null }))} />
              </ActiveTag>
            )}
            <ClearAllBtn onClick={handleClearAll}>전체 해제</ClearAllBtn>
          </ActiveFilters>
        )}

        {/* 상품 그리드 */}
        <ProductGrid>
          {loading && products.length === 0
            ? Array(8).fill(null).map((_, i) => <ProductCard key={i} loading />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </ProductGrid>

        {/* 상품 없음 */}
        {!loading && products.length === 0 && (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyTitle>등록된 상품이 없습니다</EmptyTitle>
            <EmptyDesc>
              {filters.keyword
                ? `"${filters.keyword}"에 대한 검색 결과가 없습니다`
                : '경매 상품이 등록되면 여기에 표시됩니다'}
            </EmptyDesc>
          </EmptyState>
        )}

        {/* 더보기 버튼 */}
        {hasNext && (
          <LoadMoreWrapper>
            <Button variant="secondary" onClick={handleLoadMore} disabled={loading}>
              {loading ? '불러오는 중...' : '더보기'}
            </Button>
          </LoadMoreWrapper>
        )}
      </Container>
    </PageWrapper>
  );
}

export default ProductListPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 30px 0 60px;
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const TotalCount = styled.p`
  font-size: 14px;
  color: var(--text-tertiary);
  margin-top: 4px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0;
  width: 320px;

  @media (max-width: 640px) { width: 100%; }
`;

const SearchInput = styled(Input)`
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  border-right: none;
`;

const SearchBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: var(--primary);
  color: white;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transition: background 0.2s;

  &:hover { background: var(--primary-hover); }
`;

const FilterToggle = styled.button`
  display: none;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  margin-bottom: 16px;

  @media (max-width: 768px) { display: flex; }
`;

const FilterSection = styled.div`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    display: ${({ $show }) => $show ? 'block' : 'none'};
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const CategoryChip = styled.button`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  background: ${({ $active }) => $active ? 'var(--primary)' : 'var(--bg-primary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--primary)' : 'var(--border)'};
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: ${({ $active }) => $active ? 'white' : 'var(--primary)'};
  }
`;

const SortRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const SortChip = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  background: ${({ $active }) => $active ? 'var(--secondary)' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-tertiary)'};
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ActiveTag = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 13px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 20px;
  font-weight: 500;

  svg { cursor: pointer; }
`;

const ClearAllBtn = styled.button`
  font-size: 13px;
  color: var(--text-tertiary);
  background: none;

  &:hover { color: var(--danger); }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;
