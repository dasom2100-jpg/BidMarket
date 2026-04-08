import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productApi from '../api/productApi';

// ========== Async Thunks ==========

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '상품 목록을 불러올 수 없습니다'
      );
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  'product/fetchDetail',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productApi.getProduct(productId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '상품 정보를 불러올 수 없습니다'
      );
    }
  }
);

// ========== Slice ==========

const productSlice = createSlice({
  name: 'product',
  initialState: {
    // 목록
    products: [],
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,

    // 상세
    detail: null,

    // 필터
    filters: {
      sort: 'latest',
      category: null,
      keyword: '',
    },

    loading: false,
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { sort: 'latest', category: null, keyword: '' };
    },
    clearDetail(state) {
      state.detail = null;
    },
    updateCurrentPrice(state, action) {
      const { currentPrice, bidCount, status } = action.payload;
      if (state.detail) {
        state.detail.currentPrice = currentPrice;
        state.detail.bidCount = bidCount;
        state.detail.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // === Fetch Products ===
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.hasNext = action.payload.hasNext;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Fetch Detail ===
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearDetail, updateCurrentPrice } = productSlice.actions;
export default productSlice.reducer;
